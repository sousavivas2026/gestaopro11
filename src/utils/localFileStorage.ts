export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
  createdAt: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function saveFileLocally(file: File, customId?: string): Promise<StoredFile> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const base64 = reader.result as string;
      const storedFile: StoredFile = {
        id: customId || `file_${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        createdAt: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem(`file_${storedFile.id}`, JSON.stringify(storedFile));
        resolve(storedFile);
      } catch (error) {
        reject(new Error('Erro ao salvar arquivo. Espaço insuficiente.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

export function listLocalFiles(prefix = ''): StoredFile[] {
  const files: StoredFile[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('file_' + prefix)) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          files.push(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error parsing file:', key);
      }
    }
  }
  
  return files.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getLocalFile(id: string): StoredFile | null {
  try {
    const data = localStorage.getItem(`file_${id}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

export function deleteLocalFile(id: string): boolean {
  try {
    localStorage.removeItem(`file_${id}`);
    return true;
  } catch (error) {
    return false;
  }
}

export function getStorageUsage() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const item = localStorage.getItem(key);
      total += (item?.length || 0) * 2; // UTF-16 = 2 bytes per char
    }
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB estimate
  return {
    used: total,
    max: maxSize,
    percentage: (total / maxSize) * 100,
  };
}
