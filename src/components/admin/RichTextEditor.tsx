"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const FONT_SIZE_OPTIONS = ["12", "14", "16", "18", "20", "24", "28", "32"];

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

function isEmptyContent(html: string): boolean {
  const plain = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();

  return plain.length === 0;
}

function normalizeEditorHtml(input: string): string {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = input;

  wrapper.querySelectorAll("b").forEach((element) => {
    const replacement = document.createElement("strong");
    while (element.firstChild) {
      replacement.appendChild(element.firstChild);
    }
    element.replaceWith(replacement);
  });

  wrapper.querySelectorAll("i").forEach((element) => {
    const replacement = document.createElement("em");
    while (element.firstChild) {
      replacement.appendChild(element.firstChild);
    }
    element.replaceWith(replacement);
  });

  return wrapper.innerHTML.trim();
}

function replaceFontTagsWithSpans(editor: HTMLDivElement, fontSize: string) {
  editor.querySelectorAll("font[size='7']").forEach((element) => {
    const replacement = document.createElement("span");
    replacement.style.fontSize = `${fontSize}px`;

    while (element.firstChild) {
      replacement.appendChild(element.firstChild);
    }

    element.replaceWith(replacement);
  });
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Write content...",
  required = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastSyncedValueRef = useRef<string | null>(null);
  const [selectedFontSize, setSelectedFontSize] = useState("16");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    if (value === lastSyncedValueRef.current) {
      return;
    }

    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
    lastSyncedValueRef.current = value;
  }, [value]);

  const showPlaceholder = useMemo(() => isEmptyContent(value), [value]);

  const saveSelection = () => {
    const editor = editorRef.current;
    if (!editor) {
      savedRangeRef.current = null;
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      savedRangeRef.current = null;
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    savedRangeRef.current = range.cloneRange();
  };

  const restoreSelection = (): boolean => {
    const savedRange = savedRangeRef.current;
    if (!savedRange) {
      return false;
    }

    const selection = window.getSelection();
    if (!selection) {
      return false;
    }

    selection.removeAllRanges();
    selection.addRange(savedRange);
    return true;
  };

  const syncValueFromEditor = () => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const normalized = normalizeEditorHtml(editor.innerHTML);
    lastSyncedValueRef.current = normalized;
    onChange(normalized);
  };


  const executeCommand = (command: "bold" | "italic" | "underline") => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();
    restoreSelection();
    document.execCommand(command, false);
    syncValueFromEditor();
  };

  const applyTextSize = (fontSize: string) => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();
    restoreSelection();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    if (range.collapsed) {
      editor.style.fontSize = `${fontSize}px`;
      syncValueFromEditor();
      return;
    }

    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("fontSize", false, "7");
    replaceFontTagsWithSpans(editor, fontSize);

    syncValueFromEditor();
  };

  return (
    <div className="group flex flex-col gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
        {required ? " *" : ""}
      </span>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => executeCommand("bold")}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Bold
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => executeCommand("italic")}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Italic
          </button>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => executeCommand("underline")}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Underline
          </button>
          <label className="inline-flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
              Text Size
            </span>
            <select
              value={selectedFontSize}
              onChange={(event) => {
                const fontSize = event.target.value;
                setSelectedFontSize(fontSize);
                applyTextSize(fontSize);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {FONT_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="relative">
          {showPlaceholder ? (
            <p className="pointer-events-none absolute left-4 top-3 text-sm text-slate-400">
              {placeholder}
            </p>
          ) : null}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncValueFromEditor}
            onBlur={syncValueFromEditor}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            className="min-h-[320px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-6 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <p className="text-xs text-slate-500">
          Type normally and format text in real time, similar to a word editor.
        </p>
      </div>
    </div>
  );
}
