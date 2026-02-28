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

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Write content...",
  required = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [selectedFontSize, setSelectedFontSize] = useState("16");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const showPlaceholder = useMemo(() => isEmptyContent(value), [value]);

  const syncValueFromEditor = () => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const normalized = normalizeEditorHtml(editor.innerHTML);
    if (normalized !== editor.innerHTML) {
      editor.innerHTML = normalized;
    }
    onChange(normalized);
  };

  const executeCommand = (command: "bold" | "italic" | "underline") => {
    editorRef.current?.focus();
    document.execCommand(command, false);
    syncValueFromEditor();
  };

  const applyTextSize = () => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer) || range.collapsed) {
      return;
    }

    const span = document.createElement("span");
    span.style.fontSize = `${selectedFontSize}px`;

    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }

    selection.removeAllRanges();
    const nextRange = document.createRange();
    nextRange.selectNodeContents(span);
    selection.addRange(nextRange);

    syncValueFromEditor();
  };

  return (
    <label className="group flex flex-col gap-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
        {required ? " *" : ""}
      </span>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => executeCommand("bold")}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => executeCommand("italic")}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Italic
          </button>
          <button
            type="button"
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
              onChange={(event) => setSelectedFontSize(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {FONT_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={applyTextSize}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Apply Size
          </button>
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
            className="min-h-[320px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <p className="text-xs text-slate-500">
          Type normally and format text in real time, similar to a word editor.
        </p>
      </div>
    </label>
  );
}
