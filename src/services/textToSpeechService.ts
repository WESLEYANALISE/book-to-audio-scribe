
import axios from 'axios';

// Chave da API do Google Cloud
const API_KEY = 'AIzaSyDlM4OBBfKmZDMSitzbSX8OCBOgqkGCQVc';
const API_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

interface TextToSpeechOptions {
  text: string;
  voice?: {
    languageCode: string;
    name?: string;
    ssmlGender?: 'NEUTRAL' | 'MALE' | 'FEMALE' | 'SSML_VOICE_GENDER_UNSPECIFIED';
  };
  audioConfig?: {
    audioEncoding: 'LINEAR16' | 'MP3' | 'OGG_OPUS';
    speakingRate?: number;
    pitch?: number;
    volumeGainDb?: number;
    sampleRateHertz?: number;
  };
}

const defaultOptions: TextToSpeechOptions = {
  text: '',
  voice: {
    languageCode: 'pt-BR',
    ssmlGender: 'NEUTRAL'
  },
  audioConfig: {
    audioEncoding: 'MP3',
    speakingRate: 1.0,
    pitch: 0
  }
};

export const synthesizeSpeech = async (
  text: string, 
  options: Partial<TextToSpeechOptions> = {}
): Promise<string> => {
  try {
    // Limitar o tamanho do texto para não exceder os limites da API
    // A API do Google TTS tem um limite de aproximadamente 5000 caracteres
    const maxLength = 4800;
    if (text.length > maxLength) {
      console.warn(`Texto truncado de ${text.length} para ${maxLength} caracteres`);
      text = text.substring(0, maxLength);
    }

    const mergedOptions: TextToSpeechOptions = {
      ...defaultOptions,
      ...options,
      text,
      voice: {
        ...defaultOptions.voice,
        ...options.voice
      },
      audioConfig: {
        ...defaultOptions.audioConfig,
        ...options.audioConfig
      }
    };

    const request = {
      input: { text },
      voice: mergedOptions.voice,
      audioConfig: mergedOptions.audioConfig
    };

    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      request
    );

    // A resposta contém audioContent como uma string codificada em base64
    const audioContent = response.data.audioContent;
    
    // Converter base64 para blob e criar uma URL
    const binary = atob(audioContent);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(blob);
    
    return audioUrl;
  } catch (error) {
    console.error('Erro ao sintetizar voz:', error);
    throw new Error('Falha ao converter texto em voz');
  }
};
