'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { emojiApi, uploadApi } from '@/lib/api';
import { toast } from 'sonner';

export default function EmojiUpload({ groupId, onUploadSuccess }) {
  const [active, setActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]); // { file, preview, name, code, status: 'pending'|'success'|'error' }
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length < newFiles.length) {
       toast.error('仅支持图片文件');
    }

    const newEntries = validFiles.map(file => ({
       file,
       preview: URL.createObjectURL(file), // 稍后需要释放
       name: file.name,
       code: file.name.split('.')[0].replace(/[^a-zA-Z0-9-_]/g, ''),
       status: 'pending'
    }));

    setFiles(prev => [...prev, ...newEntries]);
  };

  const removeFile = (index) => {
     URL.revokeObjectURL(files[index]?.preview);
     setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateCode = (index, newCode) => {
     setFiles(prev => prev.map((item, i) => i === index ? { ...item, code: newCode } : item));
  };

  const handleUpload = async () => {
     const pendingFiles = files.filter(f => f.status === 'pending');
     if (pendingFiles.length === 0) return;

     setUploading(true);
     let successCount = 0;
     let failCount = 0;

     // 逐个上传以便跟踪进度和处理部分失败
     for (let i = 0; i < files.length; i++) {
        const item = files[i];
        if (item.status !== 'pending') continue;

        try {
           setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));
           
           // 上传文件
           const uploadRes = await uploadApi.upload(item.file, 'emojis');
           
           // 创建表情记录
           await emojiApi.admin.createEmoji({
              groupId,
              code: item.code,
              url: uploadRes.url
           });

           setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'success' } : f));
           successCount++;
        } catch (err) {
           console.error(err);
           setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: err.message } : f));
           failCount++;
        }
     }

     setUploading(false);
     
     if (successCount > 0) {
        toast.success(`成功上传 ${successCount} 个表情`);
        onUploadSuccess?.();
        // 延迟后移除成功项
        setTimeout(() => {
           setFiles(prev => {
             prev.filter(f => f.status === 'success').forEach(f => URL.revokeObjectURL(f.preview));
             return prev.filter(f => f.status !== 'success');
           });
        }, 2000);
     }
     
     if (failCount > 0) {
        toast.error(`${failCount} 个表情上传失败`);
     }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
          uploading && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) handleFiles(Array.from(e.target.files));
            e.target.value = null;
          }}
        />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm font-medium">点击或拖拽上传图片</div>
          <div className="text-xs text-muted-foreground">支持 PNG, JPG, GIF, WebP</div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((item, index) => (
            <div key={index} className={cn(
               "flex items-center gap-3 p-2 border rounded-md bg-card",
               item.status === 'success' && "border-green-500/50 bg-green-500/5",
               item.status === 'error' && "border-destructive/50 bg-destructive/5"
            )}>
               <div className="w-10 h-10 shrink-0 bg-muted rounded overflow-hidden flex items-center justify-center">
                  <img src={item.preview} className="w-full h-full object-contain" />
               </div>
               
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-muted-foreground">Code:</span>
                     <Input 
                        value={item.code} 
                        onChange={(e) => updateCode(index, e.target.value)}
                        className="h-7 w-32 text-xs font-mono"
                        disabled={item.status !== 'pending'}
                     />
                  </div>
                  {item.status === 'error' && (
                     <div className="text-xs text-destructive mt-1">{item.error}</div>
                  )}
               </div>

               <div className="shrink-0">
                  {item.status === 'pending' && (
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile(index)}>
                        <X className="h-4 w-4" />
                     </Button>
                  )}
                  {item.status === 'uploading' && (
                     <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {item.status === 'success' && (
                     <span className="text-xs text-green-600 font-medium">已上传</span>
                  )}
               </div>
            </div>
          ))}
          
        </div>
      )}

      {files.length > 0 && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
             <Button
                variant="outline"
                onClick={() => {
                  files.forEach(f => URL.revokeObjectURL(f.preview));
                  setFiles([]);
                }}
                disabled={uploading}
             >
                清空列表
             </Button>
             <Button 
                onClick={handleUpload} 
                disabled={uploading || files.filter(f => f.status === 'pending').length === 0}
             >
                {uploading ? (
                   <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      上传中...
                   </>
                ) : (
                   <>
                      <Upload className="mr-2 h-4 w-4" />
                      开始上传 ({files.filter(f => f.status === 'pending').length})
                   </>
                )}
             </Button>
          </div>
      )}
    </div>
  );
}
