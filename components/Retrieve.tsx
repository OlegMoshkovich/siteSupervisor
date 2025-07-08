import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import DropDown from './DropDown';
import DynamicDialog from './DynamicDialog';
import Loader from './Loader';
import Constants from 'expo-constants';
import { format, startOfDay, endOfDay, parse } from 'date-fns';
import PhotoItem from './PhotoItem';
import NoteItem from './NoteItem';
import SummaryItem from './SummaryItem';
import TabBar from './TabBar';
import GenerateReportButton from './GenerateReportButton';
import LoaderOverlay from './LoaderOverlay';
import TabContentList from './TabContentList';


type PhotoWithUrl = {
  id: string;
  url: string;
  dataUrl: string | null;
  title?: string;
  note?: string;
};

export default function RetrieveScreen(props: any) {
  const [selectedProject, setSelectedProject] = useState ('Project 1');
  const [uploading, setUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [checkedPhotos, setCheckedPhotos] = useState<{ [id: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<'photos' | 'notes' | 'summaries'>('photos');
  const [summaries, setSummaries] = useState<any[]>([]);
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [dateOptions, setDateOptions] = useState<string[]>([]);


  useEffect(() => {
    const fetchDates = async () => {
      const tables = ['photos', 'summaries'];
      let allDates: string[] = [];
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('created_at');
        if (!error && data) {
          allDates = allDates.concat(
            data
              .map((row: any) => row.created_at)
              .filter(Boolean)
              .map((date: string) => format(new Date(date), 'MMMM d, yyyy'))
          );
        }
      }
      // Deduplicate and sort
      const uniqueSortedDates = Array.from(new Set(allDates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      setDateOptions(uniqueSortedDates);
    };
    fetchDates();
  }, []);

  // Helper to get date range for selectedDate (in UTC)
  const getDateRange = (selectedDate: string) => {
    if (!selectedDate) return {};
    // Parse the formatted date string (e.g., 'July 6, 2025')
    const date = parse(selectedDate, 'MMMM d, yyyy', new Date());
    // Use UTC start and end of day
    const from = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
    const to = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  };

  // Fetch all data for the selected date when dialog opens or date changes
  useEffect(() => {
    if (!dialogVisible || !selectedDate) return;
    const { from, to } = getDateRange(selectedDate);

    // Fetch photos
    const fetchPhotos = async () => {
      setPhotosLoading(true);
      setPhotos([]);
      let query = supabase.from('photos').select('*');
      if (from && to) {
        query = query.gte('created_at', from).lte('created_at', to);
      }
      const { data, error } = await query;
      if (error) {
        setPhotosLoading(false);
        return;
      }
      const photosWithDataUrl: PhotoWithUrl[] = await Promise.all(
        data.map(async (photo) => {
          try {
            const { data: fileData, error: fileError } = await supabase.storage.from('photos').download(photo.url);
            if (fileError || !fileData) {
              console.log('Download failed for', photo.url, fileError);
              return { ...photo, dataUrl: null };
            }
            const fr = new FileReader();
            return await new Promise<PhotoWithUrl>((resolve) => {
              fr.onload = () => {
                resolve({ ...photo, dataUrl: fr.result as string });
              };
              fr.readAsDataURL(fileData);
            });
          } catch (e) {
            console.log('Exception for', photo.url, e);
            return { ...photo, dataUrl: null };
          }
        })
      );
      setPhotos(photosWithDataUrl);
      setPhotosLoading(false);
    };

    // Fetch summaries
    const fetchSummaries = async () => {
      setSummariesLoading(true);
      setSummaries([]);
      let query = supabase.from('summaries').select('*').order('created_at', { ascending: false });
      if (from && to) {
        query = query.gte('created_at', from).lte('created_at', to);
      }
      const { data, error } = await query;
      if (error) {
        setSummariesLoading(false);
        return;
      }
      setSummaries(data);
      setSummariesLoading(false);
    };

    fetchPhotos();
    fetchSummaries();
  }, [selectedDate, dialogVisible]);

  // Clear data when dialog closes
  useEffect(() => {
    if (!dialogVisible) {
      setPhotos([]);
      setSummaries([]);
    }
  }, [dialogVisible]);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      // Gather checked photo notes/titles
      const selectedPhotoNotes = photos
        .filter(photo => checkedPhotos[photo.id])
        .map(photo => photo.note || photo.title || '')
        .filter(Boolean);

      // Combine all descriptions
      const allDescriptions = [...selectedPhotoNotes].join('\n');

      let summary = '';
      try {
        const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY || '';
        const requestBody = {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a construction project manager. Summarize the following selected site photos and notes into a professional construction report summary, highlighting key activities, issues, and progress.' },
            { role: 'user', content: allDescriptions }
          ],
          max_tokens: 200,
        };
        console.log('OpenAI API Key:', apiKey ? '[SET]' : '[NOT SET]');
        console.log('OpenAI Request Body:', JSON.stringify(requestBody));
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });
        console.log('OpenAI Response Status:', response.status);
        const data = await response.json();
        console.log('OpenAI Response JSON:', data);
        summary = data.choices?.[0]?.message?.content ?? 'Summary could not be generated.';
      } catch (err) {
        console.log('OpenAI Fetch Error:', err);
        summary = 'Summary could not be generated.';
      }

      // Save the summary to Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const reportTitle = 'Site Report ' + new Date().toLocaleString();
        const { error } = await supabase.from('summaries').insert([
          {
            user_id: user?.id,
            title: reportTitle,
            summary,
          },
        ]);
        if (error) {
          Alert.alert('Error', 'Could not save summary: ' + error.message);
        } else {
          Alert.alert('Report Summary', summary + '\n\n(Summary saved to reports)');
        }
      } catch (err) {
        Alert.alert('Error', 'Could not save summary.');
      }
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor: 'white', paddingTop: 80 }}>
      <View style={{ width: '86%', flexDirection: 'row', justifyContent: 'space-between' }}>
        <DropDown
          items={['Project 1', 'Project 2', 'Project 3', 'Project 4']}
          selectedItem={selectedProject}
          setSelectedItem={setSelectedProject}
          placeholder="Select a project"
        />
      </View>
      {selectedProject && (
        <View style={{ marginTop: 220}}>
          <DropDown
            items={dateOptions}
            selectedItem={selectedDate}
            placeholder="Select a date"
            setSelectedItem={(date) => {
              setSelectedDate(date);
              setDialogVisible(true);
            }}
          />
        </View>
      )}

      <DynamicDialog
        visible={dialogVisible}
        headerProps={{
          title: selectedDate,
          rightActionFontSize: 15,
          style: { paddingHorizontal: 16 },
          titleStyle: { color: 'black' },
          rightActionElement: 'Close',
          onRightAction: () => setDialogVisible(false),
          onHeaderPress: () => setDialogVisible(false),
          onBackAction: () => setDialogVisible(false),
        }}
        onClose={() => setDialogVisible(false)}
      >
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} uploading={uploading} />
        <View style={{ width: '100%', justifyContent: 'flex-start' }}>
          {activeTab === 'photos' && (
            <TabContentList
              loading={photosLoading}
              emptyMessage="No photos available."
              items={photos}
              renderItem={(photo) => (
                <PhotoItem
                  latitude={photo.latitude}
                  longitude={photo.longitude}
                  key={photo.id}
                  id={photo.id}
                  dataUrl={photo.dataUrl || ''}
                  title={photo.title}
                  note={photo.note}
                  checked={!!checkedPhotos[photo.id]}
                  onCheck={(checked) => setCheckedPhotos((prev) => ({ ...prev, [photo.id]: checked }))}
                  timestamp={photo.created_at ? format(new Date(photo.created_at), 'PPpp') : undefined}
                />
              )}
              scrollViewProps={{ contentContainerStyle: { paddingBottom: 100 } }}
            />
          )}
          {activeTab === 'summaries' && (
            <TabContentList
              loading={summariesLoading}
              emptyMessage="No summaries available."
              items={summaries}
              renderItem={(summary) => (
                <SummaryItem
                  key={summary.id}
                  title={summary.title}
                  summary={summary.summary}
                  createdAt={summary.created_at}
                />
              )}
              scrollViewProps={{ contentContainerStyle: { paddingBottom: 30 } }}
            />
          )}
        </View>
        {/* Generate Report button fixed at the bottom of the dialog */}
        {activeTab === 'photos' && (
          <GenerateReportButton
            onPress={handleGenerateReport}
            disabled={!(Object.values(checkedPhotos).some(Boolean))}
          />
        )}
        {/* Loader overlay while generating report */}
        {reportLoading && <LoaderOverlay />}
      </DynamicDialog>
    </View>
  );
}
