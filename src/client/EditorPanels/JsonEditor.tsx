import { ReactElement } from 'react';

export function JsonEditor(): ReactElement {
  return <>NYI. Will eventually get Ied but just N Y.</>;
  /*
  const [namedValues, setNamedValues] = useAtom(namedValuesAtom);
  const [, setToast] = useAtom(toastAtom);
  const [rawJson, setRawJson] = useState(() =>
    JSON.stringify(namedValues, null, 2),
  );
  const [error, setError] = useState(null);

  useEffect(() => {
    setRawJson(JSON.stringify(namedValues, null, 2));
  }, [namedValues]);

  const handleJsonChange = (val) => {
    setRawJson(val);
    try {
      const parsed = JSON.parse(val);
      setNamedValues(parsed);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson);
    setToast('JSON copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'named_values.json';
    a.click();
    URL.revokeObjectURL(url);
    setToast('Downloaded named_values.json!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const parsed = JSON.parse(content);
        setNamedValues(parsed);
        setRawJson(JSON.stringify(parsed, null, 2));
        setError(null);
        setToast(`Loaded ${file.name} successfully!`);
      } catch (err) {
        setError(`Failed to parse file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800/80 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-sky-500" />
          <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
            NamedValues JSON Raw Definition
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="px-3 py-1.5 text-xs rounded-md bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-600 cursor-pointer flex items-center gap-1.5 text-neutral-700 dark:text-neutral-200 transition-all font-medium">
            <FileUp className="w-3.5 h-3.5" /> Import File
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs rounded-md bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-600 flex items-center gap-1.5 text-neutral-700 dark:text-neutral-200 transition-all font-medium">
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs rounded-md bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 transition-all font-medium shadow-sm">
            <FileDown className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>JSON Syntax Error: {error}</span>
        </div>
      )}

      <textarea
        value={rawJson}
        onChange={(e) => handleJsonChange(e.target.value)}
        className="w-full flex-grow font-mono text-xs p-4 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-sky-500 outline-none resize-none leading-relaxed"
        spellCheck={false}
      />
    </div>
  );
  */
}
