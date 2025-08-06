import { useCallback, useEffect, useState, useRef } from 'react';
import { useFetcher } from 'react-router';
import { FileIcon } from '../Icons';

type File = {
  id: string;
  name: string;
  path: string;
  type: FileType;
  size: number | null;
  extension: string | null;
};

type FileType = 'MAIN' | 'ATTACHMENT' | 'SCAN';

type FileUploaderProps = {
  documentId: string;
  files: File[];
  className?: string;
};

export function MultiFileUploader({
  documentId,
  files,
  className = ''
}: FileUploaderProps) {
  const [activeUploadType, setActiveUploadType] = useState<FileType | null>(null);
  const [dragActive, setDragActive] = useState<FileType | null>(null);
  const fileInputRefs = {
    MAIN: useRef<HTMLInputElement>(null),
    ATTACHMENT: useRef<HTMLInputElement>(null),
    SCAN: useRef<HTMLInputElement>(null)
  };

  const fetchers = {
    MAIN: useFetcher(),
    ATTACHMENT: useFetcher(),
    SCAN: useFetcher()
  };

  // Очистка поля ввода после успешной загрузки
  useEffect(() => {
    Object.entries(fetchers).forEach(([type, fetcher]) => {
      if (fetcher.state === 'idle' && fetcher.data?.success && fileInputRefs[type as FileType].current) {
        fileInputRefs[type as FileType].current!.value = '';
      }
    });
  }, [fetchers.MAIN.data, fetchers.ATTACHMENT.data, fetchers.SCAN.data]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: FileType
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setActiveUploadType(type);
      const formData = new FormData();
      Array.from(e.target.files).forEach(file => {
        formData.append('files', file);
        formData.append('fileType', type);
      });

      fetchers[type].submit(formData, {
        method: "post",
        action: `/docs/${documentId}/edit/upload`,
        encType: "multipart/form-data",
      });
    }
  };

  const handleDrag = (type: FileType, e: React.DragEvent<HTMLDivElement>, active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active ? type : null);
  };

  const handleDrop = (type: FileType, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const input = fileInputRefs[type].current;
      if (input) {
        input.files = e.dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  };

  const isLoading = (type: FileType) => {
    return activeUploadType === type && fetchers[type].state === 'submitting';
  };

  const UploadZone = ({ type }: { type: FileType }) => (
    <div
      className={`
        border-2 border-dashed rounded-sm p-1 text-center cursor-pointer transition-colors
        ${dragActive === type ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
      `}
      onDragEnter={(e) => handleDrag(type, e, true)}
      onDragLeave={(e) => handleDrag(type, e, false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(type, e)}
      onClick={() => fileInputRefs[type].current?.click()}
    >
      <input
        ref={fileInputRefs[type]}
        type="file"
        accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.zip,.rar,.7z,.jpg,.jpeg,.png,.pdf,.tiff,.txt"
        onChange={(e) => handleFileChange(e, type)}
        disabled={isLoading(type)}
        className="hidden"
        multiple
      />
      <div className="inline-flex items-center gap-1">
        {isLoading(type) ? (
          <div className="flex items-center gap-1">
            <Spinner />
            <p>Загрузка...</p>
          </div>
        ) : (
          <>
            <UploadIcon />
            <p>Перетащите файлы сюда или кликните для выбора</p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="border rounded-sm p-1 bg-white">
        <div className="grid grid-cols-2">
          <div className="grid gap-4">
            <div className="mb-4">
              <h3 className="text-sm  text-blue-800">{TitleList['MAIN']}</h3>
              <FileList files={files} type="MAIN" />
              <UploadZone type="MAIN" />
              {fetchers.MAIN.data?.error && (
                <p className="text-red-500 mt-2 text-sm">{fetchers.MAIN.data.error}</p>
              )}
            </div>
            <div className="mb-4">
              <h3 className="text-sm text-blue-800">{TitleList['ATTACHMENT']}</h3>
              <FileList files={files} type="ATTACHMENT" />
              <UploadZone type="ATTACHMENT" />
              {fetchers.ATTACHMENT.data?.error && (
                <p className="text-red-500 mt-2 text-sm">{fetchers.ATTACHMENT.data.error}</p>
              )}
            </div>
            <div className="mb-4">
              <h3 className="text-sm text-blue-800">{TitleList['SCAN']}</h3>
              <FileList files={files} type="SCAN" />
              <UploadZone type="SCAN" />
              {fetchers.SCAN.data?.error && (
                <p className="text-red-500 mt-2 text-sm">{fetchers.SCAN.data.error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
  );
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
    </svg>
  );
}

const TitleList: Record<FileType, string> = {
  MAIN: "Основной документ",
  ATTACHMENT: "Приложения к документу",
  SCAN: "Сканированные оригиналы"
};

function FileList(props: { files: File[], type: FileType }) {
  return props.files.some(f => f.type === props.type) && (
    <div className="mb-1">
      <div className="grid gap-1">
        {props.files
          .filter(file => file.type === props.type)
          .map(file => (
            <FileItem key={file.id} file={file} />
          ))}
      </div>
    </div>
  );
}

function FileItem({ file }: { file: File }) {
  return (
    <div className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
      <div className="flex items-center gap-1 min-w-0">
        {file.extension && <FileIcon extension={file.extension} size={16} />}
        <span className="text-sm truncate">{file.name}</span>
      </div>
      <div className="flex items-center gap-3">
        {file.size && (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatFileSize(file.size)}
          </span>
        )}
        <a
          href={file.path}
          download
          className="text-blue-500 hover:text-blue-700 text-sm whitespace-nowrap"
        >
          Скачать
        </a>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}