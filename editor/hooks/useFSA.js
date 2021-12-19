'use strict';

import { FileSystemAccess } from 'editor/checks';
import { store } from 'lib/store';
import { processImport, getFileName, checkFileIsMd } from './useImport';


/**
 * open local folder to import files
 *
 * @return {FileSystemDirectoryHandle} FileSystemDirectoryHandle
 */
export async function openDirDialog() {
  if (!FileSystemAccess.support(window)) {
    return;
  }

  // clean store notes
  store.getState().setNotes({});
  store.getState().setNoteTree([]);
  store.getState().setOpenNoteIds([]);

  let dirHandle;
  try {
    // dialog to open folder
    // will prompt to require view permission
    dirHandle = await window.showDirectoryPicker();
    // store dirHandle, import files in dir and store FileHandes
    if (dirHandle) {
      store.getState().setDirHandle(dirHandle);
      const fileList = []; // File[]
      // key: filename, value: FileSystemFileHandle
      for await (const [_key, value] of dirHandle.entries()) {
        const fileData = await value.getFile();
        fileList.push(fileData);
        // upsert Handle
        //console.log(_key, value)
        if (checkFileIsMd(_key)) {
          // loss file extension info here: 
          // unique key for Handle and note
          const key = getFileName(_key);
          // store, title as key
          store.getState().upsertHandle(key, value);
        }
      }
      await processImport(fileList);
    }
  } catch (error) {
    // `showDirectoryPicker` will throw an error when the user cancels
  }

  return dirHandle;
}

/**
 * Writes the content to disk.
 *
 * @param {FileSystemFileHandle} fileHandle File handle to write to.
 * @param {string} content Contents to write.
 */
export async function writeFile(fileHandle, content) {
  if (!FileSystemAccess.support(window)) {
    return;
  }

  try {
    // Create a FileSystemWritableFileStream to write to.
    // will prompt to require write permission
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(content);
    // Close the file and write the contents to disk.
    await writable.close();
  } catch (error) {
    console.log('An error occured: ', error);
    //alert('An error occured, change can not be saved to file');
  }
}

/**
 * get or create new FileHandle and upsert to store.
 *
 * @param {string} name name or title
 * @return {FileSystemFileHandle | undefined} fileHandle File handle to write to.
 */
export async function getFileHandle(name, id = '') {
  if (!FileSystemAccess.support(window)) {
    return undefined;
  }

  let fileHandle;
  const dirHandle = store.getState().dirHandle;
  if (dirHandle) {
    try {
      const [,handleName] = getRealHandleName(name);
      fileHandle = await dirHandle.getFileHandle(handleName, {create: true});
      if (fileHandle) {
        store.getState().upsertHandle(id || name, fileHandle);
      }
    } catch (error) {
      console.log('An error occured: ', error);
      return undefined;
    }
  } else {
    console.log('no directory');
  }
  
  return fileHandle;
}

/**
 * del FileHandle
 *
 * @param {string} name name or title
 */
 export async function delFileHandle(name) {
  if (!FileSystemAccess.support(window)) {
    return;
  }

  const dirHandle = store.getState().dirHandle;
  if (dirHandle) {
    try {
      const [,handleName] = getRealHandleName(name);
      await dirHandle.removeEntry(handleName);
      store.getState().deleteHandle(name);
    } catch (error) {
      console.log('An error occured: ', error);
    }
  } else {
    console.log('no directory');
  }
}

/**
 * try to get the FileHandle name from store
 * @param {string} name name or title
 * @return {[FileSystemFileHandle, string]} [handle, name]
 * 
 * for key(name|title) loss the file extension info when store, 
 * and FileHandle name includes file extension info
 */
function getRealHandleName(name) {
  if (!FileSystemAccess.support(window)) {
    return [null, ''];
  }
  
  const existingHandle = store.getState().handles[name];
  if (existingHandle) {
    return [existingHandle, existingHandle.name];
  } else {
    return [null, `${name}.md`];
  }
}

/**
 * check if FileSystemDirectoryHandle
 * @return {[boolean, FileSystemDirectoryHandleName, boolean]} [isDir, dirName, isSupport]
 */
export function checkFSA() {
  if (!FileSystemAccess.support(window)) {
    return [false, null, false];
  }

  const dirHandle = store.getState().dirHandle;
  if (dirHandle) {
    return [true, dirHandle.name, true];
  } else {
    return [false, null, true];
  }
}
