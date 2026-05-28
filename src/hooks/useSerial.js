// src/hooks/useSerial.js
import { useState, useRef, useCallback } from 'react';

export function useSerial() {
  const [isConnected, setIsConnected] = useState(false);

  const portRef   = useRef(null);
  const readerRef = useRef(null);
  const writerRef = useRef(null);
  const abortRef  = useRef(false);

  // ── disconnect ─────────────────────────────────────────────────────────────
  const disconnect = useCallback(async () => {
    abortRef.current = true;
    try { await readerRef.current?.cancel(); } catch { /* ignore */ }
    try { await writerRef.current?.close();  } catch { /* ignore */ }
    readerRef.current = null;
    writerRef.current = null;
    try { await portRef.current?.close(); }   catch { /* ignore */ }
    portRef.current = null;
    setIsConnected(false);
  }, []);

  // ── connect ────────────────────────────────────────────────────────────────
  const connect = useCallback(async (onMessage, onError) => {
    if (portRef.current) return; // guard against double-open

    // 1. Port picker
    let port;
    try {
      port = await navigator.serial.requestPort();
    } catch (err) {
      if (err.name !== 'NotFoundError') {       // NotFoundError = user cancelled, not an error
        onError?.({ type: 'connect', message: `Nie można wybrać portu: ${err.message}` });
      }
      return;
    }

    // 2. Open
    try {
      await port.open({ baudRate: 115200 });
    } catch (err) {
      onError?.({ type: 'connect', message: `Nie można otworzyć portu: ${err.message}` });
      return;
    }

    // 3. Writer — get writer directly from port.writable, no TextEncoderStream
    const writer = port.writable.getWriter();
    writerRef.current = writer;

    // 4. Reader — get reader directly from port.readable, no TextDecoderStream
    //    Decode bytes manually so we fully control the stream lifecycle.
    const reader = port.readable.getReader();
    readerRef.current = reader;

    portRef.current  = port;
    abortRef.current = false;
    setIsConnected(true);

    // 5. Background read loop — no pipeTo, no unhandled rejections
    (async () => {
      const decoder = new TextDecoder();
      let lineBuffer = '';

      try {
        while (true) {
          let result;
          try {
            result = await reader.read();
          } catch (err) {
            // reader.cancel() throws — if we aborted intentionally, swallow it
            if (abortRef.current) break;
            onError?.({ type: 'read', message: `Błąd odczytu: ${err.message}` });
            break;
          }

          if (result.done) break;

          // result.value is Uint8Array — decode it
          lineBuffer += decoder.decode(result.value, { stream: true });

          const lines = lineBuffer.split('\n');
          lineBuffer = lines.pop(); // keep incomplete tail

          for (const raw of lines) {
            const trimmed = raw.trim();
            if (!trimmed) continue;
            try {
              onMessage(JSON.parse(trimmed));
            } catch {
              onError?.({ type: 'parse', message: `Nieczytelna wiadomość: ${trimmed.slice(0, 80)}` });
            }
          }
        }
      } finally {
        // Only clean up + set state if this wasn't an intentional disconnect
        // (disconnect() handles its own cleanup)
        if (!abortRef.current) {
          abortRef.current = true;
          readerRef.current = null;
          writerRef.current = null;
          portRef.current = null;
          try { await port.close(); } catch { /* ignore */ }
          setIsConnected(false);
          onError?.({ type: 'read', message: 'Połączenie zostało przerwane przez urządzenie.' });
        }
      }
    })();

  }, []); // stable — only uses refs

  // ── send ───────────────────────────────────────────────────────────────────
  const send = useCallback(async (data) => {
    const writer = writerRef.current;
    if (!writer) return false;
    try {
      const encoded = new TextEncoder().encode(JSON.stringify(data) + '\n');
      await writer.write(encoded);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { connect, send, disconnect, isConnected };
}