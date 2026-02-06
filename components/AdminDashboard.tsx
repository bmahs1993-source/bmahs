
import React, { useState, useEffect } from 'react';
import { SchoolData, Notice, Faculty, Banner, GalleryItem, SectionContent, Exam, Result, AdmissionApplication, NewsEvent, TickerConfig, AcademicFile, ClassTeacherAssignment, ThemeConfig, SchoolStats, ClassInfoLink, DriveFolder, OfficeProfileItem } from '../types';
import { CLASS_LIST, SECTION_LIST } from '../constants';

interface AdminDashboardProps {
  schoolData: SchoolData;
  updateSchoolData: (newData: Partial<SchoolData>) => void;
}

interface PendingDelete {
  id?: string;
  category: keyof SchoolData;
  label: string;
  isSingleField?: boolean;
}

// --- SUB-COMPONENTS MOVED OUTSIDE TO PREVENT FOCUS LOSS ---

const MockupResourcePicker: React.FC<{
  currentUrl?: string;
  label: string;
  onUpdate: (url: string, name: string) => void;
  helperText?: string;
  setUploading: (val: boolean) => void;
  optimizeDriveLink: (url: string) => string;
}> = ({ currentUrl, label, onUpdate, helperText, setUploading, optimizeDriveLink }) => {
  const isDrive = currentUrl?.includes('drive.google.com') || (currentUrl && !currentUrl.startsWith('data:'));
  const [mode, setMode] = useState<'upload' | 'drive'>(isDrive ? 'drive' : 'upload');
  const [tempUrl, setTempUrl] = useState(currentUrl || '');
  const [showPreview, setShowPreview] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate(reader.result as string, file.name);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const isDriveLink = tempUrl.includes('drive.google.com');

  return (
    <div className="space-y-4">
      <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
      
      <div className="flex bg-slate-100/50 p-1 rounded-[22px] w-fit border border-slate-100">
         <button 
           type="button"
           onClick={() => setMode('upload')}
           className={`px-8 py-2.5 rounded-[18px] text-[10px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'upload' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}
         >
           <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0l-4-4m4-4v12" /></svg>
           Upload
         </button>
         <button 
           type="button"
           onClick={() => setMode('drive')}
           className={`px-8 py-2.5 rounded-[18px] text-[10px] font-black uppercase transition-all flex items-center gap-2 ${mode === 'drive' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}
         >
           <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-3.5 h-3.5" />
           Drive
         </button>
      </div>

      {mode === 'upload' ? (
        <div className="relative group w-full">
          <input type="file" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
          <div className="p-8 border-2 border-dashed border-sky-200 bg-sky-50/20 rounded-[35px] text-center space-y-3 transition-all group-hover:bg-sky-50/50">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto text-sky-500 shadow-sm border border-sky-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
             </div>
             <p className="text-[9px] font-black uppercase text-sky-600 tracking-widest leading-tight">
               Click to Browse or Drag & Drop
             </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-5 h-5" />
              <button 
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[9px] font-black text-sky-500 uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
           </div>
           <div className="relative">
              <input 
                type="text" 
                value={tempUrl}
                onChange={(e) => { setTempUrl(e.target.value); onUpdate(optimizeDriveLink(e.target.value), 'Drive Resource'); }}
                className="w-full p-4 bg-white border border-slate-900 rounded-[22px] font-black text-xs text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Paste Google Drive sharing link..."
              />
              {tempUrl && <button type="button" onClick={() => { setTempUrl(''); onUpdate('', ''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">✕</button>}
           </div>
           {isDriveLink && (
             <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Google Drive Link Detected</span>
             </div>
           )}
           {showPreview && tempUrl && (
             <div className="aspect-video bg-white rounded-[25px] overflow-hidden border shadow-inner">
               <iframe src={tempUrl} className="w-full h-full border-none" />
             </div>
           )}
           <p className="text-[8px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
             {helperText || 'Ensure "Anyone with the link" permission is set for Drive links.'}
           </p>
        </div>
      )}
    </div>
  );
};

const PageEditor: React.FC<{
  title: string;
  contentField: keyof SchoolData;
  pdfField: keyof SchoolData;
  isEditMode: boolean;
  localData: SchoolData;
  updateLocalField: (f: keyof SchoolData, v: any) => void;
  setUploading: (v: boolean) => void;
  optimizeDriveLink: (u: string) => string;
}> = ({ title, contentField, pdfField, isEditMode, localData, updateLocalField, setUploading, optimizeDriveLink }) => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <div className={`p-12 rounded-[60px] border transition-all ${isEditMode ? 'bg-white border-sky-400/50 shadow-2xl' : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800/50 backdrop-blur-md'}`}>
      <h4 className="font-black text-3xl text-slate-900 dark:text-sky-400 uppercase tracking-tighter mb-10">{title} Content Master</h4>
      {isEditMode ? (
        <textarea 
          value={(localData as any)[contentField] || ''} 
          onChange={(e) => updateLocalField(contentField, e.target.value)} 
          className="w-full p-12 bg-slate-100 dark:bg-slate-950 rounded-[45px] border border-slate-200 dark:border-slate-800 outline-none font-bold text-slate-800 dark:text-slate-200 h-96 text-lg shadow-inner focus:ring-8 focus:ring-sky-100 transition-all resize-none"
          placeholder={`Tell the world about ${title}...`}
        />
      ) : (
        <div className="p-12 bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-[45px] border border-slate-100 dark:border-slate-700/20 font-bold text-slate-900 dark:text-slate-200 min-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed italic text-lg">
          {(localData as any)[contentField]}
        </div>
      )}
    </div>
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-12 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl">
      <h4 className="font-black text-2xl text-slate-900 dark:text-sky-400 uppercase tracking-tighter mb-8">Official Document / PDF Resource</h4>
      {isEditMode ? (
         <MockupResourcePicker 
          label={`${title} Document Resource`}
          currentUrl={(localData as any)[pdfField]}
          onUpdate={(url, name) => updateLocalField(pdfField, url)}
          setUploading={setUploading}
          optimizeDriveLink={optimizeDriveLink}
         />
      ) : (
        (localData as any)[pdfField] ? (
          <div className="space-y-6">
            <a href={(localData as any)[pdfField]} target="_blank" rel="noreferrer" className="inline-block bg-slate-900 text-white px-12 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all">View Document</a>
            <div className="aspect-video bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden border border-slate-200 shadow-inner">
              <iframe src={(localData as any)[pdfField]} className="w-full h-full border-none" />
            </div>
          </div>
        ) : (
          <div className="p-12 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[45px] text-center font-black uppercase text-xs text-slate-300 tracking-widest">No Document Attached</div>
        )
      )}
    </div>
  </div>
);

const PersonnelCard: React.FC<{ 
  person: Faculty, 
  isEditMode: boolean, 
  onUpdate: (fields: Partial<Faculty>) => void, 
  onDelete: () => void,
  setUploading: (v: boolean) => void 
}> = ({ person, isEditMode, onUpdate, onDelete, setUploading }) => {
  const handleFileUploadLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate({ image: reader.result as string });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-slate-950 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center group relative overflow-hidden">
      <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-sky-100 dark:border-sky-900/30 relative">
        <img src={person.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
        {isEditMode && (
          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <span className="text-white text-xs font-black uppercase">Change</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUploadLocal} />
          </label>
        )}
      </div>
      {isEditMode ? (
        <div className="w-full space-y-3">
          <input 
            value={person.name} 
            onChange={(e) => onUpdate({ name: e.target.value })} 
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-black text-xs text-center" 
            placeholder="Name" 
          />
          <input 
            value={person.designation} 
            onChange={(e) => onUpdate({ designation: e.target.value })} 
            className="w-full p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-[10px] text-center" 
            placeholder="Designation" 
          />
        </div>
      ) : (
        <div className="text-center">
          <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{person.name}</h5>
          <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mt-1">{person.designation}</p>
        </div>
      )}
      {isEditMode && (
        <button type="button" onClick={onDelete} className="mt-6 text-red-500 hover:text-red-700 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      )}
    </div>
  );
};

// --- END SUB-COMPONENTS ---

const AdminDashboard: React.FC<AdminDashboardProps> = ({ schoolData, updateSchoolData }) => {
  const [localData, setLocalData] = useState<SchoolData>(schoolData);
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'administration' | 'teachers' | 'academics' | 'co-curricular' | 'admission' | 'gallery' | 'corner' | 'drive' | 'office_profiles' | 'settings'>('home');
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showResetCode, setShowResetCode] = useState(false);
  const [showOfficePass, setShowOfficePass] = useState(false);

  useEffect(() => {
    setLocalData(schoolData);
  }, [schoolData]);

  useEffect(() => {
    if (saveStatus === 'success') {
      const timer = setTimeout(() => setSaveStatus('idle'), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const handleSave = () => {
    setSaveStatus('saving');
    updateSchoolData(localData);
    setSaveStatus('success');
  };

  const updateLocalField = (field: keyof SchoolData, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const updateStats = (field: keyof SchoolStats, value: string) => {
    setLocalData(prev => ({
      ...prev,
      stats: { ...prev.stats, [field]: value }
    }));
  };

  const updateTickerConfig = (field: keyof TickerConfig, value: any) => {
    setLocalData(prev => ({
      ...prev,
      tickerConfig: { ...prev.tickerConfig, [field]: value }
    }));
  };

  const updateThemeConfig = (field: keyof ThemeConfig, value: any) => {
    setLocalData(prev => ({
      ...prev,
      themeConfig: { ...prev.themeConfig, [field]: value }
    }));
  };

  const initiateDelete = (id: string | undefined, category: keyof SchoolData, label: string, isSingleField: boolean = false) => {
    if (!isEditMode) return;
    setPendingDelete({ id, category, label, isSingleField });
  };

  const executeDelete = () => {
    if (!pendingDelete) return;
    const { id, category, isSingleField } = pendingDelete;
    
    if (isSingleField) {
      updateLocalField(category, undefined);
    } else {
      const list = localData[category] as any[];
      if (Array.isArray(list)) {
        updateLocalField(category, list.filter(item => item.id !== id));
      }
    }
    setPendingDelete(null);
  };

  const addItem = (key: keyof SchoolData, newItem: any) => {
    if (!isEditMode) return;
    const list = (localData[key] as any[]) || [];
    updateLocalField(key, [{ ...newItem, id: Date.now().toString() }, ...list]);
  };

  const updateItem = (key: keyof SchoolData, id: string, updatedFields: any) => {
    if (!isEditMode) return;
    const list = (localData[key] as any[]) || [];
    updateLocalField(key, list.map(item => item.id === id ? { ...item, ...updatedFields } : item));
  };

  const optimizeDriveLink = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com') && url.includes('/view')) {
      return url.split('?')[0].replace('/view', '/preview');
    }
    if (url.includes('drive.google.com/file/d/')) {
       const parts = url.split('/');
       const idIndex = parts.indexOf('d') + 1;
       if (parts[idIndex]) {
          return `https://drive.google.com/file/d/${parts[idIndex]}/preview`;
       }
    }
    return url;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string, fileName: string) => void) => {
    if (!isEditMode) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string, file.name);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditMode) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const promises = Array.from(files).map((file: File) => {
      return new Promise<GalleryItem>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            url: reader.result as string,
            type: file.type.startsWith('video') ? 'video' : 'image',
            caption: ''
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(newItems => {
      updateLocalField('gallery', [...localData.gallery, ...newItems]);
      setUploading(false);
    });
  };

  const updateSectionText = (id: string, body: string) => {
    const newSections = localData.sections.map(s => s.id === id ? { ...s, body } : s);
    updateLocalField('sections', newSections);
  };

  const generateNewResetCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    updateLocalField('adminResetCode', newCode);
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
    { id: 'administration', label: 'Administration', icon: '🏢' },
    { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
    { id: 'academics', label: 'Academics', icon: '🎓' },
    { id: 'co-curricular', label: 'Co-Curricular', icon: '⚽' },
    { id: 'admission', label: 'Admission', icon: '📩' },
    { id: 'gallery', label: 'Gallery', icon: '📸' },
    { id: 'corner', label: 'Notice Board', icon: '📰' },
    { id: 'drive', label: 'Drive', icon: '📂' },
    { id: 'office_profiles', label: 'Office Profiles', icon: '🏢' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const PersonnelManager = ({ title, category }: { title: string, category: keyof SchoolData }) => {
    const list = (localData[category] as Faculty[]) || [];
    return (
      <div className="space-y-10 p-10 bg-slate-50 dark:bg-slate-900/20 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-inner">
        <div className="flex justify-between items-center">
          <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{title}</h4>
          {isEditMode && (
            <button 
              onClick={() => addItem(category, { name: 'New Member', designation: 'Designation', image: '' })}
              className="px-6 py-3 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl"
            >
              + Add Member
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {list.map(person => (
            <PersonnelCard 
              key={person.id} 
              person={person} 
              isEditMode={isEditMode}
              onUpdate={(fields) => updateItem(category, person.id, fields)}
              onDelete={() => initiateDelete(person.id, category, person.name)}
              setUploading={setUploading}
            />
          ))}
          {list.length === 0 && (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px]">
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No personnel added to this section.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AcademicFileManager = ({ title, category }: { title: string, category: 'syllabuses' | 'classRoutines' }) => {
    const list = localData[category] || [];
    return (
      <div className="space-y-12 p-12 bg-slate-50 dark:bg-slate-950/30 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-inner">
        <div className="flex justify-between items-center">
          <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{title} Center</h4>
          {isEditMode && (
            <button 
              onClick={() => addItem(category, { title: `New ${title}`, targetClass: 'All', url: '' })}
              className="px-8 py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl"
            >
              + Add {title}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {list.map(file => (
            <div key={file.id} className="bg-white dark:bg-slate-900 p-10 rounded-[50px] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 flex flex-col">
              {isEditMode ? (
                <>
                  <div className="space-y-4">
                    <input 
                      value={file.title} 
                      onChange={(e) => updateItem(category, file.id, { title: e.target.value })}
                      className="w-full p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-sm"
                      placeholder="Resource Title (e.g. Annual Exam Routine)"
                    />
                    <select 
                      value={file.targetClass}
                      onChange={(e) => updateItem(category, file.id, { targetClass: e.target.value })}
                      className="w-full p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-xs"
                    >
                      {CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <MockupResourcePicker 
                    label={`${title} Resource`}
                    currentUrl={file.url}
                    onUpdate={(url, name) => updateItem(category, file.id, { url, fileName: name })}
                    setUploading={setUploading}
                    optimizeDriveLink={optimizeDriveLink}
                  />
                </>
              ) : (
                <>
                  <div className="flex-grow">
                    <span className="text-[10px] font-black bg-sky-100 dark:bg-sky-900/50 text-sky-600 px-5 py-2 rounded-full uppercase tracking-widest inline-block mb-4">{file.targetClass}</span>
                    <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-4">{file.title}</h5>
                    {file.url && <p className="text-[10px] text-slate-400 italic font-bold">📎 {file.fileName || 'Resource Attached'}</p>}
                  </div>
                </>
              )}
              <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                {file.url && <a href={file.url} target="_blank" rel="noreferrer" className="flex-grow py-4 bg-slate-900 text-white rounded-2xl text-center font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Full Preview</a>}
                {isEditMode && <button type="button" onClick={() => initiateDelete(file.id, category, file.title)} className="bg-red-500 text-white px-8 rounded-2xl shadow-xl hover:bg-red-600 transition-all">🗑️</button>}
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[50px]">
              <p className="text-slate-400 font-black uppercase text-sm tracking-[0.3em] opacity-40">No academic resources registered.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const OfficeProfilesManager = () => {
    const list = localData.officeProfiles || [];
    const types = [
      { id: 'drive', label: 'Cloud Drive', color: 'bg-emerald-500', icon: '☁️' },
      { id: 'govt_portal', label: 'Govt. Portal', color: 'bg-red-500', icon: '🏛️' },
      { id: 'other', label: 'Other Resource', color: 'bg-heading', icon: '🔗' },
    ];

    return (
      <div className="space-y-12 animate-in fade-in duration-500">
        <div className="flex justify-between items-center px-4">
          <div className="space-y-1">
            <h4 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Office Profiles & Govt. Links</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shared portal resources accessible via Office Credentials</p>
          </div>
          {isEditMode && (
            <button 
              onClick={() => addItem('officeProfiles', { title: 'New Resource', url: '', type: 'govt_portal', description: 'Institutional resource description...' })}
              className="px-8 py-4 bg-red-600 text-white rounded-[25px] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              + Add Office Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {list.map(item => (
            <div key={item.id} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-10 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 flex flex-col group transition-all hover:translate-y-[-5px]">
               <div className="flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                     <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white text-2xl shadow-xl ${types.find(t => t.id === item.type)?.color || 'bg-slate-500'}`}>
                        {types.find(t => t.id === item.type)?.icon || '📂'}
                     </div>
                  </div>
                  
                  {isEditMode ? (
                    <div className="space-y-4">
                       <input 
                         value={item.title} 
                         onChange={(e) => updateItem('officeProfiles', item.id, { title: e.target.value })}
                         className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-lg"
                         placeholder="Resource Title..."
                       />
                       <select 
                         value={item.type}
                         onChange={(e) => updateItem('officeProfiles', item.id, { type: e.target.value as any })}
                         className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-xs"
                       >
                         {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                       </select>
                       <textarea 
                         value={item.description}
                         onChange={(e) => updateItem('officeProfiles', item.id, { description: e.target.value })}
                         className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-medium text-xs h-20"
                         placeholder="What is this portal for?"
                       />
                       <input 
                         value={item.url}
                         onChange={(e) => updateItem('officeProfiles', item.id, { url: e.target.value })}
                         className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-xs text-sky-500"
                         placeholder="Target URL..."
                       />
                    </div>
                  ) : (
                    <>
                      <div>
                        <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">{item.title}</h5>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{types.find(t => t.id === item.type)?.label}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic leading-relaxed">{item.description}</p>
                    </>
                  )}
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                  <button 
                    onClick={() => item.url && window.open(item.url, '_blank')}
                    className="flex-grow py-4 bg-slate-900 text-white rounded-2xl text-center font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
                    disabled={!item.url}
                  >
                    🚀 Open Portal ↗
                  </button>
                  {isEditMode && (
                    <button 
                      onClick={() => initiateDelete(item.id, 'officeProfiles', item.title)}
                      className="bg-red-500 text-white px-6 rounded-2xl shadow-xl hover:bg-red-600 transition-all"
                    >
                      🗑️
                    </button>
                  )}
               </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[60px] space-y-6">
              <div className="text-6xl opacity-30">📂</div>
              <h5 className="text-xl font-black text-slate-400 uppercase tracking-tighter">No Office Profiles Managed</h5>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Add govt. portals or institutional cloud drives for public access.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Added ClassStudentInfoManager to fix the "Cannot find name 'ClassStudentInfoManager'" error.
  const ClassStudentInfoManager = () => {
    const list = localData.classInfoLinks || [];
    return (
      <div className="space-y-12 p-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Student Info & Spreadsheet Links</h4>
            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={localData.isStudentInfoEnabled} 
                  onChange={(e) => updateLocalField('isStudentInfoEnabled', e.target.checked)} 
                  disabled={!isEditMode}
                  className="w-5 h-5 accent-accent"
                />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest group-hover:text-accent transition-colors">Enable Public View</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={localData.useCalculatedStudentCount} 
                  onChange={(e) => updateLocalField('useCalculatedStudentCount', e.target.checked)} 
                  disabled={!isEditMode}
                  className="w-5 h-5 accent-accent"
                />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest group-hover:text-accent transition-colors">Use Calculated Student Count</span>
              </label>
            </div>
          </div>
          {isEditMode && (
            <button 
              onClick={() => addItem('classInfoLinks', { title: 'Class Spreadsheet', targetClass: 'Class 6', url: '', type: 'spreadsheet', studentCount: 0 })}
              className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
            >
              + Add Link
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {list.map(link => (
            <div key={link.id} className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-inner space-y-6">
              {isEditMode ? (
                <div className="space-y-4">
                  <input 
                    value={link.title} 
                    onChange={(e) => updateItem('classInfoLinks', link.id, { title: e.target.value })}
                    className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl font-black text-sm"
                    placeholder="Link Title (e.g. Student List 2025)"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      value={link.targetClass}
                      onChange={(e) => updateItem('classInfoLinks', link.id, { targetClass: e.target.value })}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl font-bold text-xs"
                    >
                      {CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input 
                      type="number"
                      value={link.studentCount || 0}
                      onChange={(e) => updateItem('classInfoLinks', link.id, { studentCount: parseInt(e.target.value) || 0 })}
                      className="p-4 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl font-bold text-xs"
                      placeholder="Student Count"
                    />
                  </div>
                  <input 
                    value={link.url} 
                    onChange={(e) => updateItem('classInfoLinks', link.id, { url: e.target.value })}
                    className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl font-black text-xs text-sky-500"
                    placeholder="Sheet URL (Google Sheets etc.)"
                  />
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-2 inline-block">{link.targetClass}</span>
                    <h5 className="text-xl font-black text-slate-800 dark:text-white uppercase">{link.title}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Students: {link.studentCount || 0}</p>
                  </div>
                  {link.url && (
                    <a href={link.url} target="_blank" rel="noreferrer" className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      📊
                    </a>
                  )}
                </div>
              )}
              {isEditMode && (
                <button 
                  onClick={() => initiateDelete(link.id, 'classInfoLinks', link.title)}
                  className="w-full py-3 bg-red-100 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Delete Link
                </button>
              )}
            </div>
          ))}
          {list.length === 0 && (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px]">
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No spreadsheet links added.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Added DriveManager to fix the "Cannot find name 'DriveManager'" error.
  const DriveManager = () => {
    const list = localData.officeDriveLinks || [];
    const categories = ['academic', 'office', 'financial', 'archive', 'personal'];
    
    return (
      <div className="space-y-12 animate-in fade-in duration-500">
        <div className="flex justify-between items-center px-4">
          <div className="space-y-1">
            <h4 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Shared Cloud Storage</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal folder links for institutional management</p>
          </div>
          {isEditMode && (
            <button 
              onClick={() => addItem('officeDriveLinks', { folderName: 'New Folder', folderUrl: '', category: 'academic', description: 'Folder description...' })}
              className="px-8 py-4 bg-sky-600 text-white rounded-[25px] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
            >
              + Create Drive Link
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {list.map(folder => (
            <div key={folder.id} className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-10 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 flex flex-col group transition-all hover:translate-y-[-5px]">
               <div className="flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                     <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/30 rounded-3xl flex items-center justify-center text-sky-600 dark:text-sky-400 text-2xl shadow-xl">
                        {folder.isLocked ? '🔒' : '📂'}
                     </div>
                  </div>
                  
                  {isEditMode ? (
                    <div className="space-y-4">
                       <input 
                         value={folder.folderName} 
                         onChange={(e) => updateItem('officeDriveLinks', folder.id, { folderName: e.target.value })}
                         className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-lg"
                         placeholder="Folder Name..."
                       />
                       <select 
                         value={folder.category}
                         onChange={(e) => updateItem('officeDriveLinks', folder.id, { category: e.target.value as any })}
                         className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-widest"
                       >
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <textarea 
                         value={folder.description}
                         onChange={(e) => updateItem('officeDriveLinks', folder.id, { description: e.target.value })}
                         className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-medium text-xs h-20"
                         placeholder="What's inside this folder?"
                       />
                       <input 
                         value={folder.folderUrl}
                         onChange={(e) => updateItem('officeDriveLinks', folder.id, { folderUrl: e.target.value })}
                         className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-black text-xs text-sky-500"
                         placeholder="Drive Sharing Link..."
                       />
                       <label className="flex items-center gap-3 px-2 cursor-pointer">
                         <input 
                           type="checkbox" 
                           checked={folder.isLocked} 
                           onChange={(e) => updateItem('officeDriveLinks', folder.id, { isLocked: e.target.checked })} 
                           className="w-4 h-4 accent-sky-500"
                         />
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mark as Secure/Locked</span>
                       </label>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-2">{folder.folderName}</h5>
                        <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{folder.category} Resource</span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic leading-relaxed">{folder.description}</p>
                    </>
                  )}
               </div>

               <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                  <button 
                    onClick={() => folder.folderUrl && window.open(folder.folderUrl, '_blank')}
                    className="flex-grow py-4 bg-slate-900 text-white rounded-2xl text-center font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2"
                    disabled={!folder.folderUrl}
                  >
                    🚀 Open Drive ↗
                  </button>
                  {isEditMode && (
                    <button 
                      onClick={() => initiateDelete(folder.id, 'officeDriveLinks', folder.folderName)}
                      className="bg-red-500 text-white px-6 rounded-2xl shadow-xl hover:bg-red-600 transition-all"
                    >
                      🗑️
                    </button>
                  )}
               </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="col-span-full py-32 text-center border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[60px] space-y-6">
              <div className="text-6xl opacity-30">📂</div>
              <h5 className="text-xl font-black text-slate-400 uppercase tracking-tighter">No Drive Folders Linked</h5>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect institutional Google Drive folders for easy management access.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col lg:flex-row gap-12">
      <aside className="w-full lg:w-72 shrink-0">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[50px] p-10 shadow-2xl border border-slate-200 dark:border-slate-800 sticky top-24">
          <div className="flex flex-col items-center mb-10 text-center px-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent/20 mb-4 shadow-xl">
              <img 
                src={localData.adminProfilePic || 'https://via.placeholder.com/150'} 
                // Fixed: Added missing quotes around 'object-contain'
                className={`w-full h-full ${localData.adminProfilePicFit === 'contain' ? 'object-contain' : 'object-cover'}`} 
                alt="Admin" 
              />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">Admin Portal</h2>
            <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1 opacity-70">Super User</p>
          </div>
          
          <div className="mb-10 px-4 bg-slate-100 dark:bg-slate-950 p-6 rounded-[30px] border border-slate-200 dark:border-white/10 shadow-inner">
             <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Edit Mode</span>
                  <span className={`text-[9px] font-bold ${isEditMode ? 'text-accent' : 'text-slate-400'}`}>{isEditMode ? 'ACTIVE' : 'LOCKED'}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all focus:outline-none shadow-xl ${isEditMode ? 'bg-accent' : 'bg-slate-400 dark:bg-slate-800'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-2xl transition-transform ${isEditMode ? 'translate-x-9' : 'translate-x-1'}`} />
                </button>
             </div>
          </div>

          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-4 no-scrollbar pb-6 lg:pb-0 mb-10">
            {tabs.map(tab => (
              <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`shrink-0 lg:w-full text-left px-8 py-5 rounded-3xl transition-all flex items-center gap-5 font-black text-xs uppercase tracking-widest ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-2xl scale-105' : 'bg-slate-50 dark:bg-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                <span className="text-2xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="px-4 pt-10 border-t border-slate-200 dark:border-white/10">
             <button type="button" onClick={handleSave} disabled={saveStatus === 'saving'} className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-4 ${saveStatus === 'success' ? 'bg-green-500 text-white' : 'bg-accent text-white hover:scale-105'} disabled:opacity-50`}>
               {saveStatus === 'saving' ? <div className="animate-spin w-6 h-6 border-4 border-white border-t-transparent rounded-full"></div> : saveStatus === 'success' ? '✅ Data Saved Permanently' : '💾 Save Changes'}
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-grow bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-10 md:p-16 rounded-[60px] shadow-2xl border border-slate-200 dark:border-slate-800 relative min-h-[800px]">
        {uploading && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl rounded-[60px]">
            <div className="text-center space-y-6">
              <div className="animate-spin w-20 h-20 border-8 border-accent border-t-transparent rounded-full mx-auto shadow-2xl"></div>
              <p className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-widest">Processing Media...</p>
            </div>
          </div>
        )}

        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
           <div className="space-y-2">
              <h3 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Manage {tabs.find(t => t.id === activeTab)?.label}</h3>
              {!isEditMode && <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] px-1">View Mode Enabled</p>}
           </div>
        </header>

        {activeTab === 'home' && (
          <div className="space-y-16 animate-in fade-in duration-500">
             {/* Latest News Ticker Settings */}
             <div className={`p-10 rounded-[50px] border transition-all ${isEditMode ? 'bg-white border-amber-200 dark:bg-slate-900/50 shadow-2xl' : 'bg-slate-50 dark:bg-white/5 border-slate-200'}`}>
                <h4 className="font-black text-2xl mb-8 uppercase text-slate-900 dark:text-amber-500 tracking-tighter flex items-center gap-4">
                  <span>📢</span> Latest News Ticker Configuration
                </h4>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-2">Ticker Scrolling Text</label>
                    {isEditMode ? (
                      <textarea 
                        value={localData.marqueeText} 
                        onChange={(e) => updateLocalField('marqueeText', e.target.value)} 
                        className="w-full p-6 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl font-black text-sm text-slate-800 shadow-inner h-24" 
                        placeholder="Enter the scrolling message for the home page..."
                      />
                    ) : (
                      <div className="w-full p-6 bg-white dark:bg-slate-800/50 rounded-3xl font-black text-slate-900 dark:text-white border border-slate-200 dark:border-transparent italic">
                        {localData.marqueeText}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-2">Scroll Duration (sec)</label>
                      {isEditMode ? (
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" min="5" max="100" step="5"
                            value={localData.tickerConfig.speed} 
                            onChange={(e) => updateTickerConfig('speed', parseInt(e.target.value))} 
                            className="flex-grow accent-amber-500"
                          />
                          <span className="font-black text-sm text-slate-700 w-8">{localData.tickerConfig.speed}s</span>
                        </div>
                      ) : (
                        <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-200 dark:border-transparent">{localData.tickerConfig.speed} seconds</div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-2">Font Size (px)</label>
                      {isEditMode ? (
                        <select 
                          value={localData.tickerConfig.fontSize} 
                          onChange={(e) => updateTickerConfig('fontSize', e.target.value)} 
                          className="w-full p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-sm text-slate-800 shadow-inner"
                        >
                          {['12px', '14px', '16px', '18px', '20px', '24px'].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                        </select>
                      ) : (
                        <div className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-200 dark:border-transparent">{localData.tickerConfig.fontSize}</div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-2">Background Color</label>
                      {isEditMode ? (
                        <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                          <input 
                            type="color"
                            value={localData.tickerConfig.backgroundColor} 
                            onChange={(e) => updateTickerConfig('backgroundColor', e.target.value)} 
                            className="w-full h-8 cursor-pointer rounded-lg overflow-hidden border-none"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-transparent font-black">
                          <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: localData.tickerConfig.backgroundColor }}></div>
                          <span>{localData.tickerConfig.backgroundColor}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-2">Text Color</label>
                      {isEditMode ? (
                        <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                          <input 
                            type="color"
                            value={localData.tickerConfig.textColor} 
                            onChange={(e) => updateTickerConfig('textColor', e.target.value)} 
                            className="w-full h-8 cursor-pointer rounded-lg overflow-hidden border-none"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-transparent font-black">
                          <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: localData.tickerConfig.textColor }}></div>
                          <span>{localData.tickerConfig.textColor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
             </div>

             <div className={`p-10 rounded-[50px] border transition-all ${isEditMode ? 'bg-white border-sky-200 dark:bg-slate-900/50 shadow-2xl' : 'bg-slate-50 dark:bg-white/5 border-slate-200'}`}>
                <h4 className="font-black text-2xl mb-8 uppercase text-slate-900 dark:text-sky-400 tracking-tighter">Quick Stats</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                   {Object.keys(localData.stats).map((key) => {
                     const isCalculatedStudent = key === 'students' && localData.useCalculatedStudentCount;
                     return (
                      <div key={key} className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-2">{key}</label>
                         {isEditMode && !isCalculatedStudent ? (
                           <input value={(localData.stats as any)[key]} onChange={(e) => updateStats(key as any, e.target.value)} className="w-full p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-sm text-slate-800 shadow-inner" />
                         ) : (
                           <div className={`w-full p-4 rounded-2xl font-black text-slate-900 dark:text-white border ${isCalculatedStudent ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-transparent'}`}>
                             {isCalculatedStudent ? (localData.classInfoLinks?.reduce((acc, curr) => acc + (curr.studentCount || 0), 0) || 0) : (localData.stats as any)[key]}
                             {isCalculatedStudent && <span className="text-[8px] block opacity-60">Auto-Calculated</span>}
                           </div>
                         )}
                      </div>
                     );
                   })}
                </div>
             </div>

             <div className="space-y-8">
                <div className="flex justify-between items-center px-6">
                  <h4 className="font-black text-4xl uppercase text-slate-900 dark:text-white tracking-tighter">Main Slider Banners</h4>
                  {isEditMode && (
                    <button 
                      type="button"
                      onClick={() => addItem('banners', { imageUrl: 'https://via.placeholder.com/1200x600', title: 'New Banner', subtitle: 'Add a description' })} 
                      className="px-8 py-4 bg-emerald-500 text-white rounded-[25px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all"
                    >
                      + Add Banner
                    </button>
                  )}
                </div>
                <div className="grid gap-12">
                  {localData.banners.map((banner) => (
                    <div key={banner.id} className={`p-10 rounded-[60px] border flex flex-col md:flex-row gap-12 transition-all relative group ${isEditMode ? 'bg-white border-sky-100 dark:bg-slate-900/50 shadow-2xl' : 'bg-slate-50 dark:bg-white/5 border-slate-200 shadow-sm'}`}>
                       <div className="w-full md:w-80 space-y-6 shrink-0">
                          <div className="relative aspect-[16/9] rounded-[45px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-200">
                            <img src={banner.imageUrl} className="w-full h-full object-cover" />
                          </div>
                          {isEditMode && (
                             <div className="relative">
                               <input type="file" id={`banner-up-${banner.id}`} className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateItem('banners', banner.id, { imageUrl: url }))} />
                               <label htmlFor={`banner-up-${banner.id}`} className="w-full py-4 bg-sky-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer hover:bg-sky-600 transition-all shadow-lg">
                                 📷 Change Image
                               </label>
                             </div>
                          )}
                       </div>
                       <div className="flex-grow space-y-6 py-2">
                          {isEditMode ? (
                            <>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Banner Heading</label>
                                 <input value={banner.title} onChange={e => updateItem('banners', banner.id, { title: e.target.value })} className="w-full p-5 bg-slate-50/50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[25px] font-black text-xl text-slate-800 dark:text-white" placeholder="Heading..." />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Sub-Text / Slogan</label>
                                 <input value={banner.subtitle} onChange={e => updateItem('banners', banner.id, { subtitle: e.target.value })} className="w-full p-5 bg-slate-50/50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[25px] font-bold text-sm text-slate-500 dark:text-slate-400" placeholder="Description..." />
                              </div>
                            </>
                          ) : (
                            <div className="space-y-4">
                              <h5 className="font-black text-4xl text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{banner.title}</h5>
                              <p className="text-xl font-bold text-slate-500 dark:text-slate-400">{banner.subtitle}</p>
                            </div>
                          )}
                       </div>
                       {isEditMode && (
                         <button 
                           type="button"
                           onClick={() => initiateDelete(banner.id, 'banners', banner.title)} 
                           className="absolute -right-8 top-1/2 -translate-y-1/2 w-24 h-24 bg-red-500 text-white rounded-full flex items-center justify-center shadow-[0_20px_40px_-5px_rgba(255,75,75,0.4)] hover:scale-110 active:scale-95 transition-all group overflow-hidden"
                         >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="text-3xl relative z-10">🗑️</span>
                         </button>
                       )}
                    </div>
                  ))}
                </div>
             </div>

             {/* Redesigned Featured News & Events Section */}
             <div className="space-y-12 pt-16 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center px-4">
                  <h4 className="font-black text-4xl uppercase text-slate-900 dark:text-white tracking-tighter">Featured News & Events</h4>
                  {isEditMode && (
                    <button 
                      type="button"
                      onClick={() => addItem('newsEvents', { title: 'New Event', date: new Date().toLocaleDateString(), content: 'Add content here...', imageUrl: '' })}
                      className="px-8 py-4 bg-emerald-500 text-white rounded-[25px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all"
                    >
                      + Add Event
                    </button>
                  )}
                </div>
                
                <div className="space-y-16">
                  {localData.newsEvents.map((event) => (
                    <div key={event.id} className="bg-white dark:bg-slate-950 p-12 rounded-[60px] border border-emerald-100 dark:border-emerald-950 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative animate-in fade-in duration-500">
                       <div className="flex flex-col lg:flex-row gap-16">
                          {/* Left Column: Visuals */}
                          <div className="w-full lg:w-96 space-y-10 shrink-0">
                             <div className="relative aspect-[4/3] rounded-[45px] overflow-hidden bg-slate-50 border shadow-inner group">
                                {event.imageUrl ? (
                                  <img src={event.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                     <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
                             </div>
                             
                             {isEditMode && (
                               <MockupResourcePicker 
                                  label="Event Photo"
                                  currentUrl={event.imageUrl}
                                  onUpdate={(url) => updateItem('newsEvents', event.id, { imageUrl: url })}
                                  helperText="Upload a sharp cover image or paste a Drive direct link."
                                  setUploading={setUploading}
                                  optimizeDriveLink={optimizeDriveLink}
                               />
                             )}
                          </div>

                          {/* Middle Column: Details */}
                          <div className="flex-grow space-y-8">
                             {isEditMode ? (
                               <>
                                 <div className="space-y-6">
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Heading</label>
                                       <input 
                                         value={event.title} 
                                         onChange={e => updateItem('newsEvents', event.id, { title: e.target.value })} 
                                         className="w-full p-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] font-black text-2xl text-slate-800 dark:text-white"
                                         placeholder="Event Heading..."
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Date Reference</label>
                                       <input 
                                         value={event.date} 
                                         onChange={e => updateItem('newsEvents', event.id, { date: e.target.value })} 
                                         className="w-full p-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] font-black text-sm text-slate-700 dark:text-slate-300"
                                         placeholder="e.g. February 14, 2022"
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Description</label>
                                       <textarea 
                                         value={event.content} 
                                         onChange={e => updateItem('newsEvents', event.id, { content: e.target.value })} 
                                         className="w-full p-8 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[35px] font-bold text-lg text-slate-600 dark:text-slate-400 h-48 resize-none shadow-inner"
                                         placeholder="Narrate the event details here..."
                                       />
                                    </div>
                                 </div>

                                 <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                                    <MockupResourcePicker 
                                      label="Attachment (PDF/Image)"
                                      currentUrl={event.attachmentUrl}
                                      onUpdate={(url, name) => updateItem('newsEvents', event.id, { attachmentUrl: url, fileName: name })}
                                      helperText="Paste a Drive link for larger PDF documents or images."
                                      setUploading={setUploading}
                                      optimizeDriveLink={optimizeDriveLink}
                                    />
                                 </div>
                               </>
                             ) : (
                               <div className="space-y-8">
                                  <h5 className="font-black text-5xl text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{event.title}</h5>
                                  <div className="flex items-center gap-4">
                                     <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                     <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{event.date}</span>
                                  </div>
                                  <p className="text-xl font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed border-l-4 border-emerald-100 dark:border-emerald-900 pl-8">{event.content}</p>
                                  {event.attachmentUrl && (
                                    <div className="pt-6">
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" /></svg>
                                          Resource Attached
                                       </span>
                                    </div>
                                  )}
                               </div>
                             )}
                          </div>
                       </div>

                       {/* Red Delete Control */}
                       {isEditMode && (
                         <button 
                           type="button"
                           onClick={() => initiateDelete(event.id, 'newsEvents', event.title)}
                           className="absolute -right-8 top-1/2 -translate-y-1/2 w-24 h-24 bg-[#ff4b4b] text-white rounded-full flex items-center justify-center shadow-[0_20px_40px_-5px_rgba(255,75,75,0.4)] hover:scale-110 active:scale-95 transition-all group overflow-hidden"
                         >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="text-3xl relative z-10">🗑️</span>
                         </button>
                       )}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'academics' && (
          <div className="space-y-16 animate-in fade-in duration-500">
            <PageEditor 
              title="Academics" 
              contentField="academicsContent" 
              pdfField="academicsPdfUrl" 
              isEditMode={isEditMode} 
              localData={localData} 
              updateLocalField={updateLocalField} 
              setUploading={setUploading} 
              optimizeDriveLink={optimizeDriveLink}
            />
            <ClassStudentInfoManager />
            <AcademicFileManager title="Syllabuses" category="syllabuses" />
            <AcademicFileManager title="Class Routines" category="classRoutines" />
          </div>
        )}

        {activeTab === 'drive' && <DriveManager />}

        {activeTab === 'office_profiles' && <OfficeProfilesManager />}

        {activeTab === 'corner' && (
           <div className="space-y-24 animate-in fade-in duration-500">
              {/* Notices Section */}
              <section className="space-y-12">
                <div className="flex justify-between items-center px-6">
                  <h4 className="font-black text-3xl uppercase text-slate-900 dark:text-white tracking-tighter">Official Notices</h4>
                  {isEditMode && (
                    <button onClick={() => addItem('notices', { title: 'Notice Headline', date: new Date().toLocaleDateString(), content: 'Type message here...', important: false })} className="px-8 py-4 bg-amber-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">+ Post Notice</button>
                  )}
                </div>
                {localData.notices.map(n => (
                  <div key={n.id} className={`p-12 rounded-[60px] border flex flex-col md:flex-row gap-10 transition-all ${isEditMode ? 'bg-white border-amber-400 shadow-2xl' : 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                    <div className="flex-grow space-y-6">
                      {isEditMode ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Notice Headline (Full Title)</label>
                              <textarea 
                                value={n.title} 
                                onChange={e => updateItem('notices', n.id, { title: e.target.value })} 
                                className="w-full p-8 border-2 border-slate-200 rounded-[40px] font-black text-2xl shadow-inner bg-slate-50 text-slate-800 focus:border-amber-400 focus:ring-4 focus:ring-amber-50 outline-none transition-all resize-none h-32"
                                placeholder="Enter a descriptive headline for this notice..."
                              />
                            </div>
                            <div className="space-y-3">
                              <MockupResourcePicker 
                                label="Notice Attachment"
                                currentUrl={n.attachmentUrl}
                                onUpdate={(url, name) => updateItem('notices', n.id, { attachmentUrl: url, fileName: name })}
                                setUploading={setUploading}
                                optimizeDriveLink={optimizeDriveLink}
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Detailed Notice Message Body</label>
                            <textarea value={n.content} onChange={e => updateItem('notices', n.id, { content: e.target.value })} className="w-full p-8 border-2 border-slate-200 rounded-[40px] font-bold text-lg h-64 bg-slate-50 text-slate-700 focus:border-amber-400 focus:ring-4 focus:ring-amber-50 outline-none transition-all" placeholder="Write the full message content here..." />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 mb-4">
                            {/* Fixed: changed notice.important to n.important to match the variable in map function */}
                            {n.important && <span className="bg-red-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Priority</span>}
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{n.date}</span>
                          </div>
                          <h5 className="font-black text-3xl text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-4">{n.title}</h5>
                          <p className="text-lg font-bold text-slate-700 dark:text-slate-300 italic border-l-4 border-accent pl-6">{n.content}</p>
                        </>
                      )}
                    </div>
                    {isEditMode && (
                      <div className="flex flex-col gap-4 min-w-[200px] justify-center">
                        <button type="button" onClick={() => updateItem('notices', n.id, { important: !n.important })} className={`w-full py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${n.important ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{n.important ? 'Remove Priority' : 'Mark Priority'}</button>
                        <button type="button" onClick={() => initiateDelete(n.id, 'notices', n.title)} className="w-full py-5 bg-red-100 text-red-600 rounded-3xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all">Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </section>

              {/* Exam Routines Section */}
              <section className="space-y-12">
                <div className="flex justify-between items-center px-6">
                  <h4 className="font-black text-3xl uppercase text-slate-900 dark:text-white tracking-tighter">Exam Routines</h4>
                  {isEditMode && (
                    <button onClick={() => addItem('exams', { title: 'Exam Routine', date: new Date().toLocaleDateString(), subject: 'Full', targetClass: 'All', targetSection: 'All' })} className="px-8 py-4 bg-sky-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">+ Add Routine</button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {localData.exams.map(e => (
                    <div key={e.id} className={`p-10 rounded-[50px] border transition-all ${isEditMode ? 'bg-white border-sky-400 shadow-2xl' : 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                       {isEditMode ? (
                         <div className="space-y-4">
                            <input value={e.title} onChange={val => updateItem('exams', e.id, { title: val.target.value })} className="w-full p-4 border border-slate-200 rounded-2xl font-black text-lg bg-slate-100" placeholder="Routine Title" />
                            <div className="grid grid-cols-2 gap-4">
                               <select value={e.targetClass} onChange={val => updateItem('exams', e.id, { targetClass: val.target.value })} className="p-4 border border-slate-200 rounded-2xl text-xs font-black">{CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}</select>
                               <select value={e.targetSection} onChange={val => updateItem('exams', e.id, { targetSection: val.target.value })} className="p-4 border border-slate-200 rounded-2xl text-xs font-black">{SECTION_LIST.map(s => <option key={s} value={s}>{s}</option>)}</select>
                            </div>
                            <MockupResourcePicker 
                              label="Routine File"
                              currentUrl={e.attachmentUrl}
                              onUpdate={(url, name) => updateItem('exams', e.id, { attachmentUrl: url, fileName: name })}
                              setUploading={setUploading}
                              optimizeDriveLink={optimizeDriveLink}
                            />
                            <button type="button" onClick={() => initiateDelete(e.id, 'exams', e.title)} className="w-full py-4 bg-red-100 text-red-500 rounded-2xl font-black text-[10px] uppercase">Remove Routine</button>
                         </div>
                       ) : (
                         <div className="flex flex-col h-full justify-between">
                            <div className="space-y-2 mb-6">
                               <span className="text-[9px] font-black bg-sky-100 text-sky-600 px-3 py-1 rounded-full uppercase">{e.targetClass} • {e.targetSection}</span>
                               <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-tight">{e.title}</h5>
                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Published: {e.date}</p>
                            </div>
                            {e.attachmentUrl && <a href={e.attachmentUrl} target="_blank" rel="noreferrer" className="w-full py-4 bg-slate-800 text-white rounded-2xl text-center font-black text-[10px] uppercase hover:scale-105 transition-all">View Routine</a>}
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Exam Results Section */}
              <section className="space-y-12">
                <div className="flex justify-between items-center px-6">
                  <h4 className="font-black text-3xl uppercase text-slate-900 dark:text-white tracking-tighter">Exam Results</h4>
                  {isEditMode && (
                    <button onClick={() => addItem('results', { studentName: 'Student Name', studentRoll: 'Roll ID', targetClass: 'Class 6', targetSection: 'Morning', gpa: '5.00', date: new Date().toLocaleDateString() })} className="px-8 py-4 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">+ Add Result</button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {localData.results.map(r => (
                    <div key={r.id} className={`p-10 rounded-[50px] border transition-all ${isEditMode ? 'bg-white border-emerald-500 shadow-2xl' : 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                       {isEditMode ? (
                         <div className="space-y-4">
                            <input value={r.studentName} onChange={val => updateItem('results', r.id, { studentName: val.target.value })} className="w-full p-4 border border-slate-200 rounded-2xl font-black text-sm" placeholder="Student Name" />
                            <div className="grid grid-cols-2 gap-4">
                               <input value={r.studentRoll} onChange={val => updateItem('results', r.id, { studentRoll: val.target.value })} className="p-4 border border-slate-200 rounded-2xl text-xs font-black" placeholder="Roll ID" />
                               <input value={r.gpa} onChange={val => updateItem('results', r.id, { gpa: val.target.value })} className="p-4 border border-slate-200 rounded-2xl text-xs font-black" placeholder="GPA / Grade" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <select value={r.targetClass} onChange={val => updateItem('results', r.id, { targetClass: val.target.value })} className="p-4 border border-slate-200 rounded-2xl text-xs font-black">{CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}</select>
                               <select value={r.targetSection} onChange={val => updateItem('results', r.id, { targetSection: val.target.value })} className="p-4 border border-slate-200 rounded-2xl text-xs font-black">{SECTION_LIST.map(s => <option key={s} value={s}>{s}</option>)}</select>
                            </div>
                            <MockupResourcePicker 
                              label="Result Sheet"
                              currentUrl={r.attachmentUrl}
                              onUpdate={(url, name) => updateItem('results', r.id, { attachmentUrl: url, fileName: name })}
                              setUploading={setUploading}
                              optimizeDriveLink={optimizeDriveLink}
                            />
                            <button type="button" onClick={() => initiateDelete(r.id, 'results', r.studentName)} className="w-full py-4 bg-red-100 text-red-500 rounded-2xl font-black text-[10px] uppercase">Remove Result</button>
                         </div>
                       ) : (
                         <div className="space-y-6">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h6 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">{r.studentName}</h6>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Roll: {r.studentRoll}</p>
                               </div>
                               <span className="text-3xl font-black text-emerald-500 drop-shadow-sm">{r.gpa}</span>
                            </div>
                            <div className="bg-slate-100 p-4 rounded-3xl text-[9px] font-black uppercase text-slate-500 flex justify-between">
                               <span>{r.targetClass}</span>
                               <span>{r.targetSection}</span>
                            </div>
                            {r.attachmentUrl && <a href={r.attachmentUrl} target="_blank" rel="noreferrer" className="block w-full py-3 bg-heading text-white rounded-2xl text-center font-black text-[9px] uppercase hover:bg-slate-800">Preview Result Sheet</a>}
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              </section>
           </div>
        )}

        {activeTab === 'gallery' && (
           <div className="space-y-12 animate-in fade-in duration-500">
              <h4 className="font-black text-3xl uppercase text-slate-900 dark:text-white px-6 tracking-tighter">Media Gallery Management</h4>
              
              {isEditMode && (
                <div className="p-10 border-4 border-dashed border-sky-400/30 rounded-[60px] bg-sky-50 dark:bg-sky-950/20 text-center space-y-6 hover:bg-sky-50 transition-all">
                  <div className="text-5xl">📤</div>
                  <h5 className="text-xl font-black uppercase tracking-tighter text-slate-800 dark:text-white">Mass Media Upload</h5>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select multiple images or videos at once</p>
                  <label className="inline-block px-12 py-5 bg-sky-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest cursor-pointer shadow-xl hover:bg-sky-700 transition-all">
                    Browse Files
                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMultipleGalleryUpload} />
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                 {localData.gallery.map(item => (
                   <div key={item.id} className="bg-slate-50 dark:bg-slate-950 rounded-[45px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col group">
                      <div className="aspect-square relative overflow-hidden bg-black">
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center text-white text-5xl">🎬</div>
                        ) : (
                          <img src={item.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        )}
                        {isEditMode && (
                          <button type="button" onClick={() => initiateDelete(item.id, 'gallery', item.caption || 'Gallery Item')} className="absolute top-4 right-4 bg-red-500 text-white p-4 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                        )}
                      </div>
                      <div className="p-6 space-y-4">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-2">Image Caption</label>
                        {isEditMode ? (
                          <input 
                            value={item.caption} 
                            onChange={(e) => updateItem('gallery', item.id, { caption: e.target.value })} 
                            className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-inner"
                            placeholder="Type a descriptive caption..."
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 italic px-2">{item.caption || 'No caption added.'}</p>
                        )}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'administration' && (
          <div className="space-y-20 animate-in fade-in duration-500">
            <PageEditor 
              title="General Administration" 
              contentField="administrationContent" 
              pdfField="administrationPdfUrl" 
              isEditMode={isEditMode} 
              localData={localData} 
              updateLocalField={updateLocalField} 
              setUploading={setUploading} 
              optimizeDriveLink={optimizeDriveLink}
            />
            
            <div className="space-y-16">
              <h4 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter border-b-4 border-sky-400 inline-block px-4 pb-2">Institutional Personnel</h4>
              
              <div className="space-y-12 p-10 bg-sky-50 dark:bg-sky-950/20 rounded-[60px] border border-sky-100 dark:border-sky-900/30">
                <h5 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Head Teacher</h5>
                <div className="max-w-md">
                  <PersonnelCard 
                    person={localData.headTeacher || { id: 'head', name: 'Head Teacher Name', designation: 'Head Teacher', image: '' }}
                    isEditMode={isEditMode}
                    onUpdate={(fields) => updateLocalField('headTeacher', { ...localData.headTeacher, ...fields })}
                    onDelete={() => initiateDelete(undefined, 'headTeacher', localData.headTeacher?.name || 'Head Teacher', true)}
                    setUploading={setUploading}
                  />
                  {!localData.headTeacher && isEditMode && (
                    <button 
                      onClick={() => updateLocalField('headTeacher', { id: 'head', name: 'New Head Teacher', designation: 'Head Teacher', image: '' })}
                      className="mt-6 w-full py-4 bg-sky-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest"
                    >
                      + Assign Head Teacher
                    </button>
                  )}
                </div>
              </div>

              {/* Head Master's Message Editor */}
              <div className="space-y-6">
                <h5 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Head Master's Official Message</h5>
                {isEditMode ? (
                  <textarea 
                    value={localData.sections.find(s => s.id === 'headMasterMsg')?.body || ''} 
                    onChange={(e) => updateSectionText('headMasterMsg', e.target.value)} 
                    className="w-full p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[40px] font-bold text-slate-700 dark:text-slate-200 h-40 shadow-inner"
                    placeholder="Enter Head Master's message for home page side box..."
                  />
                ) : (
                  <div className="p-8 bg-slate-100 dark:bg-slate-800/30 rounded-[40px] font-bold text-slate-600 dark:text-slate-400 italic">
                    {localData.sections.find(s => s.id === 'headMasterMsg')?.body}
                  </div>
                )}
              </div>

              <PersonnelManager title="Assistant Head Teachers" category="assistantHeadTeachers" />

              {/* Assistant Head Master's Message Editor */}
              <div className="space-y-6">
                <h5 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Assistant Head Master's Official Message</h5>
                {isEditMode ? (
                  <textarea 
                    value={localData.sections.find(s => s.id === 'assistantHeadMasterMsg')?.body || ''} 
                    onChange={(e) => updateSectionText('assistantHeadMasterMsg', e.target.value)} 
                    className="w-full p-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[40px] font-bold text-slate-700 dark:text-slate-200 h-40 shadow-inner"
                    placeholder="Enter Assistant Head Master's message for home page side box..."
                  />
                ) : (
                  <div className="p-8 bg-slate-100 dark:bg-slate-800/30 rounded-[40px] font-bold text-slate-600 dark:text-slate-400 italic">
                    {localData.sections.find(s => s.id === 'assistantHeadMasterMsg')?.body}
                  </div>
                )}
              </div>

              <PersonnelManager title="School Committee Members" category="committeeMembers" />
              <PersonnelManager title="Governing Body" category="governingBody" />
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <PageEditor 
            title="About School" 
            contentField="aboutContent" 
            pdfField="aboutPdfUrl" 
            isEditMode={isEditMode} 
            localData={localData} 
            updateLocalField={updateLocalField} 
            setUploading={setUploading} 
            optimizeDriveLink={optimizeDriveLink}
          />
        )}
        
        {activeTab === 'teachers' && <PersonnelManager title="Faculty Members" category="faculty" />}
        
        {activeTab === 'co-curricular' && (
          <PageEditor 
            title="Extra Activities" 
            contentField="coCurricularContent" 
            pdfField="coCurricularPdfUrl" 
            isEditMode={isEditMode} 
            localData={localData} 
            updateLocalField={updateLocalField} 
            setUploading={setUploading} 
            optimizeDriveLink={optimizeDriveLink}
          />
        )}
        
        {activeTab === 'admission' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <PageEditor 
              title="Admission Policy" 
              contentField="admissionInfo" 
              pdfField="admissionPdfUrl" 
              isEditMode={isEditMode} 
              localData={localData} 
              updateLocalField={updateLocalField} 
              setUploading={setUploading} 
              optimizeDriveLink={optimizeDriveLink}
            />
            
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-12 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-10">
               <div className="flex items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                  <h4 className="font-black text-3xl text-slate-900 dark:text-white uppercase tracking-tighter">Online Application Portal Settings</h4>
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${localData.isAdmissionOpen ? 'text-emerald-500' : 'text-red-500'}`}>
                        Registration {localData.isAdmissionOpen ? 'OPEN' : 'CLOSED'}
                     </span>
                     <button 
                        type="button"
                        onClick={() => updateLocalField('isAdmissionOpen', !localData.isAdmissionOpen)}
                        disabled={!isEditMode}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''} ${localData.isAdmissionOpen ? 'bg-emerald-500' : 'bg-red-500'}`}
                     >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${localData.isAdmissionOpen ? 'translate-x-7' : 'translate-x-1'}`} />
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-1">Registration Link (Google Form / Drive)</label>
                     {isEditMode ? (
                        <input 
                           type="url" 
                           value={localData.admissionFormUrl || ''} 
                           onChange={(e) => updateLocalField('admissionFormUrl', e.target.value)}
                           className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl font-black text-sm text-sky-500 outline-none focus:border-accent transition-all"
                           placeholder="Paste form URL here..."
                        />
                     ) : (
                        <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-3xl font-bold text-slate-500 text-sm truncate">{localData.admissionFormUrl || 'No link set'}</div>
                     )}
                  </div>
                  <div className="space-y-3">
                     <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-1">Application Button Text</label>
                     {isEditMode ? (
                        <input 
                           type="text" 
                           value={localData.admissionButtonText || ''} 
                           onChange={(e) => updateLocalField('admissionButtonText', e.target.value)}
                           className="w-full p-5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl font-black text-sm outline-none focus:border-accent transition-all"
                           placeholder="e.g. Apply Online Now"
                        />
                     ) : (
                        <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-3xl font-bold text-slate-500 text-sm">{localData.admissionButtonText}</div>
                     )}
                  </div>
               </div>

               {localData.admissionFormUrl && (
                  <div className="space-y-4">
                     <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Live Registration Link Preview</h5>
                     <div className="p-6 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] text-center">
                        <a href={localData.admissionFormUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 bg-accent text-white px-10 py-5 rounded-[25px] font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all">
                           Test Current Link ↗
                        </a>
                     </div>
                  </div>
               )}
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="space-y-16 animate-in fade-in duration-500 pb-20">
             {/* Redesigned Institutional Branding & Theme Section */}
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-12 md:p-16 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex items-center gap-6 mb-16">
                   <div className="w-20 h-20 bg-sky-50 dark:bg-sky-900/30 rounded-[30px] flex items-center justify-center text-4xl shadow-sm">🎨</div>
                   <h4 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Institutional Branding & Theme</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                   {/* Column 1: Typography & Content Colors */}
                   <div className="space-y-10">
                      <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Typography & Content Colors</h5>
                      <div className="space-y-4">
                         {[
                           { label: 'Primary Text', sub: 'Main paragraphs & content', field: 'primaryTextColor' },
                           { label: 'Secondary Text', sub: 'Captions & labels', field: 'secondaryTextColor' },
                           { label: 'Headings', sub: 'Large titles & branding', field: 'headingColor' }
                         ].map(item => (
                           <div key={item.field} className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[35px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-900">
                              <div>
                                 <h6 className="font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{item.label}</h6>
                                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.sub}</p>
                              </div>
                              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                                 <input 
                                  type="color" 
                                  value={(localData.themeConfig as any)[item.field]}
                                  onChange={(e) => updateThemeConfig(item.field as any, e.target.value)}
                                  disabled={!isEditMode}
                                  className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer disabled:cursor-default"
                                 />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Column 2: Navigation & Global Theme */}
                   <div className="space-y-10">
                      <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Navigation & Global Theme</h5>
                      <div className="space-y-4">
                         {[
                           { label: 'Nav Link Color', sub: 'Main menu items', field: 'navTextColor' },
                           { label: 'Footer Text', sub: 'Bottom copyright area', field: 'footerTextColor' },
                           { label: 'Accent Color', sub: 'Buttons & highlights', field: 'accentColor' }
                         ].map(item => (
                           <div key={item.field} className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-950/50 rounded-[35px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-900">
                              <div>
                                 <h6 className="font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{item.label}</h6>
                                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.sub}</p>
                              </div>
                              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                                 <input 
                                  type="color" 
                                  value={(localData.themeConfig as any)[item.field]}
                                  onChange={(e) => updateThemeConfig(item.field as any, e.target.value)}
                                  disabled={!isEditMode}
                                  className="absolute inset-[-10px] w-[200%] h-[200%] cursor-pointer disabled:cursor-default"
                                 />
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="mt-16 pt-16 border-t border-slate-100 dark:border-slate-800 space-y-10">
                   <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Interface Experience</h5>
                   <div className="p-10 bg-slate-50 dark:bg-slate-950 rounded-[45px] flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-inner">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            {localData.themeConfig.isDarkMode ? '🌙' : '☀️'}
                         </div>
                         <div>
                            <h6 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-xl">Dark Interface Preference</h6>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Set the default portal appearance</p>
                         </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => updateThemeConfig('isDarkMode', !localData.themeConfig.isDarkMode)}
                        disabled={!isEditMode}
                        className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all focus:outline-none shadow-xl ${localData.themeConfig.isDarkMode ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-800'}`}
                      >
                         <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-2xl transition-transform ${localData.themeConfig.isDarkMode ? 'translate-x-11' : 'translate-x-1'}`} />
                      </button>
                   </div>
                </div>
             </div>

             {/* Mobile App Settings */}
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-12 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl">
                <h4 className="font-black text-3xl uppercase text-slate-900 dark:text-white tracking-tighter mb-12 flex items-center gap-5">
                   <span className="bg-sky-100 dark:bg-sky-900/30 p-4 rounded-3xl text-sky-600 dark:text-sky-400">📱</span> Mobile App Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Download APK / App Store Link</label>
                      {isEditMode ? (
                        <input 
                          value={localData.appDownloadUrl || ''} 
                          onChange={(e) => updateLocalField('appDownloadUrl', e.target.value)} 
                          className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner"
                          placeholder="https://..."
                        />
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-sky-500 border border-slate-100 dark:border-transparent truncate">{localData.appDownloadUrl || 'No link provided'}</div>
                      )}
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Current Version</label>
                      {isEditMode ? (
                        <input 
                          value={localData.appVersion || ''} 
                          onChange={(e) => updateLocalField('appVersion', e.target.value)} 
                          className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner"
                          placeholder="e.g. 1.0.4"
                        />
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">{localData.appVersion || 'N/A'}</div>
                      )}
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Package Size</label>
                      {isEditMode ? (
                        <input 
                          value={localData.appSize || ''} 
                          onChange={(e) => updateLocalField('appSize', e.target.value)} 
                          className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner"
                          placeholder="e.g. 12 MB"
                        />
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">{localData.appSize || 'N/A'}</div>
                      )}
                   </div>
                </div>
             </div>

             {/* Profile & Identity */}
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-12 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl">
                <h4 className="font-black text-3xl uppercase text-slate-900 dark:text-white tracking-tighter mb-12 flex items-center gap-5">
                   <span className="bg-heading/10 dark:bg-white/5 p-4 rounded-3xl text-heading dark:text-white">🛡️</span> Admin Profile & Identity
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {/* Institutional Branding Info */}
                   <div className="space-y-8">
                      <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Institutional Branding Info</h5>
                      
                      <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-inner mb-6 space-y-8">
                        <div className="flex flex-col items-center">
                          <div className="w-40 h-40 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center p-2 border-4 border-white dark:border-slate-700 shadow-2xl relative overflow-hidden group">
                             <img 
                               src={localData.logoUrl} 
                               className={`w-full h-full rounded-full ${localData.logoFit === 'contain' ? 'object-contain' : 'object-cover'}`} 
                               alt="School Logo" 
                             />
                             {isEditMode && (
                               <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                 <span className="text-white text-[10px] font-black uppercase">Change Logo</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateLocalField('logoUrl', url))} />
                               </label>
                             )}
                          </div>
                          <p className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Institutional Logo</p>
                        </div>
                        
                        {isEditMode && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-2">Logo Fitting Mode</label>
                            <div className="grid grid-cols-2 gap-4">
                              <button 
                                type="button"
                                onClick={() => updateLocalField('logoFit', 'contain')}
                                className={`py-3 rounded-2xl font-black text-[10px] uppercase border transition-all ${localData.logoFit === 'contain' ? 'bg-accent text-white border-accent' : 'bg-white text-slate-500 border-slate-200'}`}
                              >
                                Scale to Fit
                              </button>
                              <button 
                                type="button"
                                onClick={() => updateLocalField('logoFit', 'cover')}
                                className={`py-3 rounded-2xl font-black text-[10px] uppercase border transition-all ${localData.logoFit === 'cover' ? 'bg-accent text-white border-accent' : 'bg-white text-slate-500 border-slate-200'}`}
                              >
                                Fill Circle
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">School Name</label>
                           {isEditMode ? (
                             <input value={localData.schoolName} onChange={(e) => updateLocalField('schoolName', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" />
                           ) : (
                             <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">{localData.schoolName}</div>
                           )}
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Motto / Slogan</label>
                           {isEditMode ? (
                             <input value={localData.motto} onChange={(e) => updateLocalField('motto', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" />
                           ) : (
                             <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent italic">{localData.motto}</div>
                           )}
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">EIIN Number</label>
                           {isEditMode ? (
                             <input value={localData.eiin} onChange={(e) => updateLocalField('eiin', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" />
                           ) : (
                             <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">{localData.eiin}</div>
                           )}
                        </div>
                      </div>
                   </div>

                   {/* Administrative Credentials */}
                   <div className="space-y-8 bg-slate-50 dark:bg-white/5 p-8 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-inner">
                      <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Administrative Credentials</h5>
                      
                      <div className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-md mb-6 space-y-8">
                        <div className="flex flex-col items-center">
                          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-accent/20 shadow-2xl relative group">
                             <img 
                               src={localData.adminProfilePic || 'https://via.placeholder.com/150'} 
                               className={`w-full h-full rounded-full ${localData.adminProfilePicFit === 'contain' ? 'object-contain' : 'object-cover'}`} 
                               alt="Admin Profile" 
                             />
                             {isEditMode && (
                               <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                 <span className="text-white text-[10px] font-black uppercase">Upload Photo</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateLocalField('adminProfilePic', url))} />
                               </label>
                             )}
                          </div>
                          <p className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Administrator Photo</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Admin Username</label>
                           {isEditMode ? (
                             <input value={localData.adminUsername} onChange={(e) => updateLocalField('adminUsername', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" />
                           ) : (
                             <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent flex items-center justify-between">
                               <span>{localData.adminUsername}</span>
                               <span className="text-[9px] opacity-40 font-bold uppercase">Authorized ID</span>
                             </div>
                           )}
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Admin Password</label>
                           {isEditMode ? (
                             <div className="relative">
                               <input 
                                 type={showPass ? 'text' : 'password'}
                                 value={localData.adminPassword} 
                                 onChange={(e) => updateLocalField('adminPassword', e.target.value)} 
                                 className="w-full p-4 pr-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" 
                               />
                               <button 
                                 type="button"
                                 onClick={() => setShowPass(!showPass)}
                                 className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-sky-500 bg-white/10 p-2 rounded-lg"
                               >
                                 {showPass ? 'HIDE' : 'SHOW'}
                               </button>
                             </div>
                           ) : (
                             <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">••••••••••••••</div>
                           )}
                        </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Location & Media Identity */}
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-12 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl">
                <h4 className="font-black text-3xl uppercase text-slate-900 dark:text-white tracking-tighter mb-12 flex items-center gap-5">
                   <span className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-3xl text-emerald-600 dark:text-emerald-400">📍</span> Location & Media Settings
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Campus Address (Full)</label>
                      {isEditMode ? (
                        <input value={localData.address} onChange={(e) => updateLocalField('address', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" placeholder="Detailed office address..." />
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">{localData.address}</div>
                      )}
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Institutional Email</label>
                      {isEditMode ? (
                        <input value={localData.email} onChange={(e) => updateLocalField('email', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" placeholder="contact@..." />
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">{localData.email}</div>
                      )}
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Office Phone</label>
                      {isEditMode ? (
                        <input value={localData.phone} onChange={(e) => updateLocalField('phone', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" placeholder="017XX-XXXXXX" />
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">{localData.phone}</div>
                      )}
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">National Anthem (YouTube Video ID)</label>
                      {isEditMode ? (
                        <input value={localData.nationalAnthemYoutubeId} onChange={(e) => updateLocalField('nationalAnthemYoutubeId', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" placeholder="Video ID only (e.g. UoX7o_SkaS0)" />
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">{localData.nationalAnthemYoutubeId}</div>
                      )}
                   </div>
                   <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Location Map Embed URL</label>
                      {isEditMode ? (
                        <input value={localData.locationMapUrl} onChange={(e) => updateLocalField('locationMapUrl', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" placeholder="https://www.google.com/maps/embed?..." />
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-sky-500 border border-slate-100 dark:border-transparent truncate">{localData.locationMapUrl}</div>
                      )}
                   </div>
                   <div className="space-y-3 md:col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Campus Location Text (Public Label)</label>
                      {isEditMode ? (
                        <input value={localData.locationText} onChange={(e) => updateLocalField('locationText', e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner" placeholder="Campus location description..." />
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">{localData.locationText}</div>
                      )}
                   </div>
                </div>
             </div>

             {/* Student-Side Office Access Control Section */}
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-12 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl">
                <h4 className="font-black text-3xl uppercase text-slate-900 dark:text-white tracking-tighter mb-12 flex items-center gap-5">
                   <span className="bg-red-100 dark:bg-red-900/30 p-4 rounded-3xl text-red-600 dark:text-red-400">🔑</span> Office Access (Student View)
                </h4>
                <p className="text-sm font-bold text-slate-500 mb-10 px-2">Configure the "special user" credentials required for visitors to view the Office Profiles tab on the student site.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Office Portal Username</label>
                      {isEditMode ? (
                        <input 
                          value={localData.officeAccessUser} 
                          onChange={(e) => updateLocalField('officeAccessUser', e.target.value)} 
                          className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner"
                        />
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">{localData.officeAccessUser}</div>
                      )}
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Office Portal Password</label>
                      {isEditMode ? (
                        <div className="relative">
                          <input 
                            type={showOfficePass ? 'text' : 'password'}
                            value={localData.officeAccessPass} 
                            onChange={(e) => updateLocalField('officeAccessPass', e.target.value)} 
                            className="w-full p-4 pr-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-800 dark:text-white shadow-inner"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowOfficePass(!showOfficePass)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-400"
                          >
                            {showOfficePass ? 'HIDE' : 'SHOW'}
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-slate-900 dark:text-white border border-slate-100 dark:border-transparent">••••••••••••••</div>
                      )}
                   </div>
                </div>
             </div>

             {/* Security Reset Code */}
             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl p-12 rounded-[60px] border border-slate-200 dark:border-slate-800 shadow-2xl">
                <h4 className="font-black text-3xl uppercase text-slate-900 dark:text-white tracking-tighter mb-8 flex items-center gap-5">
                   <span className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-3xl text-amber-600 dark:text-amber-400">🛡️</span> Password Recovery
                </h4>
                <div className="space-y-2 pt-4">
                   <label className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-500 tracking-widest px-2">Security Reset Code (For Password Recovery)</label>
                   {isEditMode ? (
                     <div className="flex gap-4">
                       <div className="relative flex-grow">
                         <input 
                           type={showResetCode ? 'text' : 'password'}
                           value={localData.adminResetCode} 
                           onChange={(e) => updateLocalField('adminResetCode', e.target.value)} 
                           className="w-full p-4 pr-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-amber-600 shadow-inner" 
                         />
                         <button 
                           type="button"
                           onClick={() => setShowResetCode(!showResetCode)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-400"
                         >
                           {showResetCode ? 'HIDE' : 'SHOW'}
                         </button>
                       </div>
                       <button 
                         type="button"
                         onClick={generateNewResetCode}
                         className="px-6 py-4 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-amber-600"
                         title="Generate Random Code"
                       >
                         Refresh
                       </button>
                     </div>
                   ) : (
                     <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl font-black text-amber-600 border border-slate-100 dark:border-transparent flex items-center justify-between">
                       <span>{showResetCode ? localData.adminResetCode : '••••••'}</span>
                       <button 
                         type="button"
                         onClick={() => setShowResetCode(!showResetCode)}
                         className="text-[9px] opacity-40 font-bold uppercase"
                       >
                         {showResetCode ? 'Hide Code' : 'Show Code'}
                       </button>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </main>
      {/* ... Deletion Confirmation Dialog ... */}
      {pendingDelete && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-8">
          <div className="bg-white p-16 rounded-[60px] shadow-2xl text-center max-w-md w-full border border-slate-200 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-10">⚠️</div>
            <h4 className="text-3xl font-black mb-4 uppercase text-slate-900 tracking-tighter leading-none">Confirm Deletion</h4>
            <p className="text-slate-500 font-bold mb-12 uppercase text-[11px] tracking-widest leading-relaxed">
              Are you sure you want to remove:<br/>
              <span className="text-red-600">"{pendingDelete.label}"</span>?
            </p>
            <div className="grid grid-cols-2 gap-6">
              <button type="button" onClick={() => setPendingDelete(null)} className="py-6 bg-slate-100 text-slate-700 rounded-[30px] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              <button type="button" onClick={executeDelete} className="py-6 bg-red-600 text-white rounded-[30px] font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-red-700 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;