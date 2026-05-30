export default function SplitPane({ top, bottom }) {
  return (
    <div className="flex-1 flex flex-col gap-gutter px-margin-desktop pb-margin-desktop overflow-hidden min-h-0">
      <div className="flex-[55] flex flex-col gap-gutter min-h-0">
        {top}
      </div>
      <div className="flex-[45] min-h-0">
        {bottom}
      </div>
    </div>
  );
}
