import type { JSONContent } from "@tiptap/core";
import { cn } from "@/lib/utils";

interface ContentRendererProps {
  content: JSONContent | string | null;
  className?: string;
}

interface RenderNodeProps {
  node: JSONContent;
  index?: number;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMarks(
  text: string,
  marks?: JSONContent["marks"],
): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  let result: React.ReactNode = text;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        result = <strong>{result}</strong>;
        break;
      case "italic":
        result = <em>{result}</em>;
        break;
      case "underline":
        result = <u>{result}</u>;
        break;
      case "strike":
        result = <s>{result}</s>;
        break;
      case "code":
        result = (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
            {result}
          </code>
        );
        break;
      case "link": {
        const href = mark.attrs?.href as string | undefined;
        const target = mark.attrs?.target as string | undefined;
        result = (
          <a
            href={href}
            target={target}
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {result}
          </a>
        );
        break;
      }
      case "highlight": {
        const color = mark.attrs?.color as string | undefined;
        result = (
          <mark
            style={color ? { backgroundColor: color } : undefined}
            className={cn(
              !color && "bg-yellow-200 dark:bg-yellow-800",
            )}
          >
            {result}
          </mark>
        );
        break;
      }
      case "textStyle": {
        const color = mark.attrs?.color as string | undefined;
        if (color) {
          result = <span style={{ color }}>{result}</span>;
        }
        break;
      }
      default:
        break;
    }
  }

  return result;
}

function RenderNode({ node, index = 0 }: RenderNodeProps) {
  if (!node.type) return null;

  switch (node.type) {
    case "doc":
      return (
        <>
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </>
      );

    case "paragraph": {
      const textAlign = node.attrs?.textAlign as string | undefined;
      return (
        <p
          className={cn(
            "mb-2 leading-relaxed",
            textAlign === "center" && "text-center",
            textAlign === "right" && "text-right",
            textAlign === "justify" && "text-justify",
          )}
        >
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          )) ?? <br />}
        </p>
      );
    }

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const textAlign = node.attrs?.textAlign as string | undefined;
      const headingClasses = cn(
        "font-bold tracking-tight",
        level === 1 && "mt-6 mb-3 text-3xl",
        level === 2 && "mt-5 mb-2.5 text-2xl",
        level === 3 && "mt-4 mb-2 text-xl",
        level === 4 && "mt-3 mb-1.5 text-lg",
        textAlign === "center" && "text-center",
        textAlign === "right" && "text-right",
      );

      const content = node.content?.map((child, i) => (
        <RenderNode key={i} node={child} index={i} />
      ));

      switch (level) {
        case 1:
          return <h1 className={headingClasses}>{content}</h1>;
        case 2:
          return <h2 className={headingClasses}>{content}</h2>;
        case 3:
          return <h3 className={headingClasses}>{content}</h3>;
        case 4:
          return <h4 className={headingClasses}>{content}</h4>;
        default:
          return <h5 className={headingClasses}>{content}</h5>;
      }
    }

    case "bulletList":
      return (
        <ul className="mb-2 list-disc pl-6">
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </ul>
      );

    case "orderedList":
      return (
        <ol className="mb-2 list-decimal pl-6">
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </ol>
      );

    case "listItem":
      return (
        <li className="mb-1">
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </li>
      );

    case "taskList":
      return (
        <ul className="mb-2 list-none pl-0">
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </ul>
      );

    case "taskItem": {
      const checked = node.attrs?.checked as boolean;
      return (
        <li className="mb-1 flex items-start gap-2">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <span className={cn(checked && "text-muted-foreground line-through")}>
            {node.content?.map((child, i) => (
              <RenderNode key={i} node={child} index={i} />
            ))}
          </span>
        </li>
      );
    }

    case "codeBlock": {
      const language = node.attrs?.language as string | undefined;
      return (
        <div className="relative mb-3">
          {language && (
            <div className="absolute right-2 top-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {language}
            </div>
          )}
          <pre className="overflow-x-auto rounded-lg bg-muted p-4">
            <code
              className={cn(
                "font-mono text-sm",
                language && `language-${language}`,
              )}
            >
              {node.content?.map((child, i) => (
                <RenderNode key={i} node={child} index={i} />
              ))}
            </code>
          </pre>
        </div>
      );
    }

    case "blockquote":
      return (
        <blockquote className="mb-3 border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </blockquote>
      );

    case "table":
      return (
        <div className="mb-3 overflow-x-auto">
          <table className="w-full border-collapse rounded-lg border">
            {node.content?.map((child, i) => (
              <RenderNode key={i} node={child} index={i} />
            ))}
          </table>
        </div>
      );

    case "tableRow":
      return (
        <tr className="border-b bg-muted/50">
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </tr>
      );

    case "tableHeader":
      return (
        <th className="border border-input px-4 py-2 text-left font-semibold">
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </th>
      );

    case "tableCell":
      return (
        <td className="border border-input px-4 py-2">
          {node.content?.map((child, i) => (
            <RenderNode key={i} node={child} index={i} />
          ))}
        </td>
      );

    case "image": {
      const src = node.attrs?.src as string;
      const alt = (node.attrs?.alt as string) ?? "";
      const title = node.attrs?.title as string | undefined;
      const width = node.attrs?.width as string | number | undefined;
      const height = node.attrs?.height as string | number | undefined;
      return (
        <figure className="my-3">
          <img
            src={src}
            alt={alt}
            title={title}
            width={width}
            height={height}
            className="h-auto max-w-full rounded-lg"
            loading="lazy"
          />
          {alt && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    case "attachment": {
      const name = (node.attrs?.name as string) ?? "File";
      const size = node.attrs?.size as number | undefined;
      const url = node.attrs?.url as string;
      return (
        <a
          href={url}
          download={name}
          className="mb-3 flex items-center gap-3 rounded-lg border bg-muted/50 p-3 transition-colors hover:bg-muted"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            {size && (
              <p className="text-xs text-muted-foreground">
                {formatFileSize(size)}
              </p>
            )}
          </div>
        </a>
      );
    }

    case "horizontalRule":
      return <hr className="my-4 border-t" />;

    case "hardBreak":
      return <br />;

    case "text":
      return renderMarks(node.text ?? "", node.marks);

    default:
      return null;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  if (!content) return null;

  let jsonContent: JSONContent;

  if (typeof content === "string") {
    try {
      jsonContent = JSON.parse(content);
    } catch {
      return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
          <p>{escapeHtml(content)}</p>
        </div>
      );
    }
  } else {
    jsonContent = content;
  }

  if (!jsonContent || !jsonContent.type) return null;

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <RenderNode node={jsonContent} />
    </div>
  );
}
