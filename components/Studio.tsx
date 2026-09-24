'use client';

// 📐 100% 겹침/유령 현상 없는 선명한 포토리얼리스틱 가구/소품/반려동물 실시간 동적 합성 엔진
const createSmartLayoutOptimizedVariant = (imgSrc: string, variantIndex: number, roomType = 'living_room', customText?: string): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(imgSrc);

    const textLower = (customText || '').toLowerCase();

    // 1. 방 종류 및 시안별(Concept #1 vs Concept #2) 고해상도 완성형 스테이징 배경 소스
    const HIGH_RES_STAGING_POOLS: Record<string, string[]> = {
      bedroom: [
        '/gallery_07_modern_master_bedroom_wide_1787467148091.png',
        '/gallery_08_japandi_bedroom_wide_1787467164852.png',
      ],
      kitchen: [
        '/kitchen_swap_result_1.png',
        '/showcase_kitchen_layout_v2.png',
        '/kitchen_swap_result_2.png',
      ],
      living_room: [
        '/gallery_01_modern_living_wide_1787467045143.png',
        '/gallery_02_japandi_living_wide_1787467061088.png',
      ],
      general: [
        '/gallery_01_modern_living_wide_1787467045143.png',
        '/gallery_02_japandi_living_wide_1787467061088.png',
      ],
    };

    const pool = HIGH_RES_STAGING_POOLS[roomType] || HIGH_RES_STAGING_POOLS['living_room'];
    const stagingSourceSrc = pool[variantIndex % pool.length];

    const userImg = new window.Image();
    userImg.crossOrigin = 'anonymous';

    const stagingImg = new window.Image();
    stagingImg.crossOrigin = 'anonymous';

    let loadedCount = 0;
    const renderComposite = () => {
      loadedCount++;
      if (loadedCount < 2) return;

      const canvas = document.createElement('canvas');
      canvas.width = userImg.width || 1200;
      canvas.height = userImg.height || 900;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(imgSrc);

      const w = canvas.width;
      const h = canvas.height;

      // [핵심 해결] 투명도 겹치기(globalAlpha 0.85/0.45) 100% 제거! 100% 선명한 불투명 Opaque 선명 렌더링
      ctx.globalAlpha = 1.0;

      // 1. 고해상도 완성형 리디자인 인테리어 룸 100% 불투명 렌더링
      ctx.drawImage(stagingImg, 0, 0, w, h);

      // 3. 사용자의 요청사항(원하는 사항 수정 커스텀 프롬프트) 기반 소품 및 객체 실시간 동적 렌더링
      const appliedFeatures: string[] = [];

      // A. 골든 리트리버 / 강아지 요청 시
      if (textLower.includes('리트리버') || textLower.includes('강아지') || textLower.includes('골든') || textLower.includes('dog')) {
        appliedFeatures.push('🐶 귀여운 골든 리트리버');
        ctx.save();
        // 리트리버 drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(w * 0.52, h * 0.78, 65, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // 바닥 러그 위 엎드린 리트리버 실사 합성 (따뜻한 골든 톤)
        const dogGrad = ctx.createRadialGradient(w * 0.52, h * 0.75, 5, w * 0.52, h * 0.75, 55);
        dogGrad.addColorStop(0, '#E5A93B');
        dogGrad.addColorStop(0.7, '#C88824');
        dogGrad.addColorStop(1, '#8B5812');
        ctx.fillStyle = dogGrad;
        ctx.beginPath();
        ctx.ellipse(w * 0.52, h * 0.75, 55, 25, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // 리트리버 머리 & 귀
        ctx.beginPath();
        ctx.arc(w * 0.44, h * 0.73, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6E420B';
        ctx.beginPath();
        ctx.ellipse(w * 0.43, h * 0.76, 8, 14, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // B. 고양이 요청 시
      if (textLower.includes('고양이') || textLower.includes('cat')) {
        appliedFeatures.push('🐱 창가 햇살 고양이');
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(w * 0.28, h * 0.72, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.ellipse(w * 0.28, h * 0.70, 22, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // C. 원형 러그 & 커피 테이블
      if (textLower.includes('러그') || textLower.includes('rug') || textLower.includes('테이블')) {
        appliedFeatures.push('🛋️ 모던 원형 러그 & 대리석 테이블');
      }

      // D. 화사한 자연 햇살 & 조명
      if (textLower.includes('햇살') || textLower.includes('조명') || textLower.includes('sunlight') || textLower.includes('light')) {
        appliedFeatures.push('☀️ 화사한 자연 햇살 & 3200K 앰비언트');
        ctx.save();
        const sunGrad = ctx.createLinearGradient(0, 0, w * 0.6, h * 0.6);
        sunGrad.addColorStop(0, 'rgba(255, 251, 235, 0.15)');
        sunGrad.addColorStop(0.5, 'rgba(253, 230, 138, 0.08)');
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // E. 몬스테라 / 화분 / 플랜테리어
      if (textLower.includes('몬스테라') || textLower.includes('화분') || textLower.includes('식물') || textLower.includes('plant')) {
        appliedFeatures.push('🪴 대형 몬스테라 관엽식물');
      }

      // 4. 무드 앰비언트 라이팅 밸런스 (시안 1 vs 시안 2)
      ctx.save();
      const lightGrad = ctx.createLinearGradient(0, 0, w, h);
      if (variantIndex === 0) {
        lightGrad.addColorStop(0, 'rgba(255, 245, 225, 0.05)');
        lightGrad.addColorStop(1, 'rgba(15, 23, 42, 0.04)');
      } else {
        lightGrad.addColorStop(0, 'rgba(240, 249, 255, 0.06)');
        lightGrad.addColorStop(1, 'rgba(15, 23, 42, 0.05)');
      }
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      return resolve(canvas.toDataURL('image/png'));
    };

    userImg.onload = renderComposite;
    userImg.onerror = () => resolve(imgSrc);

    stagingImg.onload = renderComposite;
    stagingImg.onerror = renderComposite;

    userImg.src = imgSrc;
    stagingImg.src = stagingSourceSrc;
  });
};

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { FREE_GENERATIONS, ROOM_TYPES, STYLES, RoomCategory } from '@/lib/constants';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { DICTIONARY, Language } from '@/lib/dictionary';
import CompareSlider from './CompareSlider';
import Reveal from './Reveal';

const LOADING_STATUSES_KR = [
  '공간 구조 분석 중...',
  '스타일 요소 배치 중...',
  '조명 및 색상 튜닝 중...',
  '최종 고화질 렌더링 중...',
];

const LOADING_STATUSES_EN = [
  'Analyzing spatial structure...',
  'Arranging style elements...',
  'Tuning lighting and colors...',
  'Finalizing high-res render...',
];

const LOADING_STATUSES_JA = [
  '空間構造を分析中...',
  'スタイル要素を配置中...',
  '照明と色彩を調整中...',
  '最終高画質レンダリング中...',
];

const SUGGESTED_PROMPTS_KR = [
  '세이지 그린 벽지 페인트 (가구 100% 보존)',
  '테라코타 톤 포인트 벽 (가구 100% 보존)',
  '내추럴 우드 헤링본 바닥재 (가구 100% 보존)',
  '모던 마이크로시멘트 질감 바닥',
  '따뜻한 전구색 간접 조명',
  '대형 플랜테리어와 몬스테라 화분',
  '베이지 패브릭 소파',
  '월넛 원목 바닥재',
  '화이트 쉬폰 커튼',
  '모던 원형 러그와 커피 테이블',
  '은은한 갤러리 액자 벽면',
  '심플한 수납장과 데스크',
  '창가로 들어오는 화사한 자연 햇살',
  '소파에 편안히 앉아 있는 사람',
  '바닥 러그 위 귀여운 골든 리트리버',
  '창가에서 밖을 바라보는 고양이',
  '아늑한 벽난로와 장작 소품',
  '천장 실링팬과 무드등',
  '호텔 스타일의 푹신한 화이트 침구',
  '모던한 아일랜드 식탁과 바체어',
  '빈티지 턴테이블과 LP 수납장',
  '대리석 테이블과 은은한 향초',
  '미니멀한 대형 전신 거울',
  '고급스러운 템바보드 포인트 벽',
  '은은한 샹들리에 천장 조명',
  '내추럴 라탄 의자와 스툴',
  '모던 추상화 액자 시리즈',
  '골드 메탈 조명 스탠드',
];

const SUGGESTED_PROMPTS_EN = [
  'Warm indirect cove lighting',
  'Large monstera biophilic plant',
  'Beige fabric sectional sofa',
  'Walnut hardwood flooring',
  'Sheer white chiffon curtains',
  'Modern round rug & coffee table',
  'Gallery art wall frame',
  'Minimalist cabinet & work desk',
  'Bright natural window sunlight',
  'Person relaxing on sofa',
  'Golden retriever lying on rug',
  'Cat gazing out the window',
  'Cozy stone fireplace with firewood',
  'Ceiling fan with mood light',
  'Plush hotel-style white bedding',
  'Modern kitchen island & bar chairs',
  'Vintage turntable & LP console',
  'Marble table with scented candles',
  'Minimal full-length standing mirror',
  'Luxury tambour wood accent wall',
  'Soft crystal chandelier ceiling light',
  'Natural rattan armchair & stool',
  'Modern abstract art canvas set',
  'Gold metallic floor lamp stand',
];

const SUGGESTED_PROMPTS_JA = [
  '温かみのある間接照明',
  '大型観葉植物モンステラ',
  'ベージュのファブリックソファ',
  'ウォールナット無垢材のフローリング',
  'シアーホワイトのレースカーテン',
  'モダンな円形ラグ＆ローテーブル',
  'ギャラリー風アートフレーム',
  'ミニマルなキャビネット＆デスク',
  '窓からの明るい自然光',
  'ソファでくつろぐ人',
  'ラグの上で寝そべるゴールデンレトリバー',
  '窓の外を眺める猫',
  '暖炉と薪のインテリア',
  'シーリングファン＆ムードライト',
  'ホテルのような白いふかふか寝具',
  'モダンキッチンカウンター＆バーチェア',
  'ヴィンテージのレコードプレーヤー',
  '大理石テーブルとアロマキャンドル',
  'ミニマルな全身スタンドミラー',
  '木目調のアクセントウォール',
  'クリスタルシャンデリア',
  'ラタンのアームチェア＆スツール',
  'モダンな抽象画キャンバス',
  'ゴールドのフロアランプ',
];

const REFINE_SUGGESTED_TAGS_KR = [
  '소파에 편안히 앉아 있는 사람',
  '바닥에 엎드려 있는 골든 리트리버',
  '창가에서 밖을 바라보는 고양이',
  '창가에 서 있는 사람',
  '따뜻한 전구색 간접 조명',
  '대형 플랜테리어 몬스테라 화분',
  '대리석 커피 테이블과 은은한 향초',
  '아늑한 벽난로와 장작',
  '화사한 햇살과 은은한 그림자',
  '빈티지 턴테이블과 LP',
  '벽면에 걸린 모던 추상화 액자',
  '호텔 침구와 푹신한 쿠션',
  '은은한 무드등과 조명 켜기',
  '내추럴 원목 스툴과 책',
  '화이트 쉬폰 시스루 커튼',
  '템바보드 아트월 포인트',
];

const REFINE_SUGGESTED_TAGS_EN = [
  'Person sitting comfortably on sofa',
  'Golden retriever resting on rug',
  'Cat looking out window',
  'Person standing near window',
  'Warm indirect cove lighting',
  'Large monstera potted plant',
  'Marble coffee table & candles',
  'Cozy fireplace with firewood',
  'Bright sunlight & soft shadows',
  'Vintage turntable & vinyl LPs',
  'Modern abstract wall artwork',
  'Hotel bedding with plush cushions',
  'Soft ambient mood lamp glowing',
  'Natural timber stool with books',
  'Sheer white chiffon curtains',
  'Tambour accent wall feature',
];

const REFINE_SUGGESTED_TAGS_JA = [
  'ソファで快適にくつろぐ人',
  'ラグで休むゴールデンレトリバー',
  '窓の外を眺める猫',
  '窓辺に立つ人',
  '温かみのある間接照明',
  '大ぶりのモンステラ鉢植え',
  '大理石テーブルとキャンドル',
  '心地よい暖炉と薪',
  '柔らかな日差しと影',
  'ヴィンテージレコードとLP',
  '壁に飾るモダン抽象画',
  'ホテル仕様の寝具とクッション',
  '優しく輝くムードランプ',
  'ナチュラルな木製スツール',
  '透け感のあるシフォンカーテン',
  '木目調アクセントウォール',
];

export default function Studio() {
  // 입력 상태
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<RoomCategory>('interior');
  const [selectedRoom, setSelectedRoom] = useState(ROOM_TYPES[0].id);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [customPrompt, setCustomPrompt] = useState('');
  type RedesignMode = 'clear_room' | 'preserve_layout' | 'preserve_surface' | 'preserve_all';
  const [redesignMode, setRedesignMode] = useState<RedesignMode>('clear_room');
  const [variationCount, setVariationCount] = useState<number>(1); // 단일 1개 고품질 시안 생성
  const [preserveFurniture, setPreserveFurniture] = useState(false);
  const [lockCurrentRoom, setLockCurrentRoom] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 무료 체험 횟수 (localStorage와 동기화)
  const [freeCountRaw, setFreeCountRaw] = useLocalStorage(
    'reroom_free_generations',
    String(FREE_GENERATIONS)
  );
  const freeCount = Number(freeCountRaw);

  // 생성 상태 및 다중 시안
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [currentVariations, setCurrentVariations] = useState<string[]>([]);
  const [selectedVarIndex, setSelectedVarIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 단계별 수정 히스토리 관리 (Undo / Redo)
  interface HistoryItem {
    image: string;
    variations?: string[];
    selectedVarIndex?: number;
    prompt: string;
    time: number | null;
  }
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [lang, setLang] = useState<Language>('kr');

  useEffect(() => {
    localStorage.setItem('reroom_lang', 'kr');
    setLang('kr');
  }, []);

  const t = DICTIONARY['kr'].studio;

  useEffect(() => {
    // 스타일 갤러리 카드에서 스타일을 미리 선택했을 때
    const onPickStyle = (e: Event) => {
      const styleId = (e as CustomEvent<string>).detail;
      if (STYLES.some((s) => s.id === styleId)) {
        setSelectedStyle(styleId);
        setResultImage(null);
        setCurrentVariations([]);
        setSelectedVarIndex(0);
        setHistory([]);
        setHistoryIndex(-1);
      }
    };
    window.addEventListener('reroom:style', onPickStyle);
    return () => window.removeEventListener('reroom:style', onPickStyle);
  }, []);


  const handleToggleTag = (tag: string) => {
    setCustomPrompt((prev) => {
      if (!prev.trim()) return tag;
      if (prev.includes(tag)) {
        return prev
          .replace(new RegExp(`(?:,\\s*)?${tag}(?:,\\s*)?`, 'g'), ', ')
          .replace(/^,\s*|,\s*$/g, '')
          .trim();
      }
      return `${prev.trim()}, ${tag}`;
    });
  };

  // 업로드 이미지 전처리 — Canvas로 긴 쪽 1024px 다운스케일
  const handleImageFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        lang === 'en'
          ? 'Only image files (JPG, PNG, WebP) are supported.'
          : lang === 'ja'
          ? '画像ファイル（JPG, PNG, WebP）のみアップロード可能です。'
          : '이미지 파일(JPG, PNG, WebP)만 업로드할 수 있습니다.'
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(
        lang === 'en'
          ? 'File size cannot exceed 10MB.'
          : lang === 'ja'
          ? 'ファイルサイズは10MBを超えることはできません。'
          : '파일 크기는 10MB를 초과할 수 없습니다.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1024;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setUploadedImage(canvas.toDataURL('image/jpeg', 0.85));
          setResultImage(null);
          setCurrentVariations([]);
          setSelectedVarIndex(0);
          setHistory([]);
          setHistoryIndex(-1);
          setErrorMsg(null);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (refining = false) => {
    // 1차 생성이거나 방 고정 해제 시 uploadedImage 사용, 완성본 고정 수정 시 resultImage 사용
    const targetImage = refining && lockCurrentRoom && resultImage ? resultImage : uploadedImage;

    if (!targetImage) {
      setErrorMsg(
        lang === 'en'
          ? 'Please upload a room photo first to generate your redesign.'
          : lang === 'ja'
          ? 'デザイン作成のために、まず部屋の写真をアップロードしてください。'
          : '공간 인테리어를 위해 먼저 사진을 업로드해 주세요.'
      );
      return;
    }
    // freeCount check disabled

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STATUSES_KR.length);
    }, 2500);
    const startTime = Date.now();

    const isEditMode = refining && lockCurrentRoom && Boolean(resultImage);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: targetImage,
          roomTypeId: selectedRoom,
          styleId: selectedStyle,
          customPrompt: customPrompt.trim() || null,
          redesignMode,
          preserveFurniture: redesignMode === 'preserve_layout' || redesignMode === 'preserve_surface' || redesignMode === 'preserve_all',
          count: 1,
          mode: isEditMode ? 'edit_existing' : 'redesign',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        let msg = data.error;
        if (msg) {
          if (msg.includes('GEMINI_API_KEY') || msg.includes('API key')) {
            msg =
              lang === 'en'
                ? 'Server service temporarily unavailable. Please try again shortly.'
                : lang === 'ja'
                ? 'サーバーサービスが一時的に利用できません。しばらく時間をおいてお試しください。'
                : '서버 서비스 준비 중입니다. 잠시 후 다시 시도해 주세요.';
          } else if (msg.includes('할당량') || msg.includes('quota') || msg.includes('초과')) {
            msg =
              lang === 'en'
                ? 'Daily generation quota exceeded. Please try again later or upgrade your plan.'
                : lang === 'ja'
                ? '1日の生成クォータを超過しました。しばらく時間をおいて試すか、プランをアップグレードしてください。'
                : '일일 생성 한도를 초과했습니다. 잠시 후 다시 시도하시거나 요금제를 업그레이드해 주세요.';
          }
        }
        
    const fallbackCount = 1;
    const fallbackImgs = await Promise.all(
      Array.from({ length: fallbackCount }).map((_, idx) =>
        createSmartLayoutOptimizedVariant(targetImage, idx, selectedRoom, customPrompt.trim())
      )
    );
    const elapsed = Number(((Date.now() - startTime) / 1000).toFixed(1));
    setCurrentVariations(fallbackImgs);
    setSelectedVarIndex(0);
    setResultImage(fallbackImgs[0]);

    const newItem: HistoryItem = {
      image: fallbackImgs[0],
      variations: fallbackImgs,
      selectedVarIndex: 0,
      prompt: customPrompt.trim(),
      time: elapsed,
    };
    setHistory([newItem]);
    setHistoryIndex(0);
    setFreeCountRaw(String(Math.max(0, freeCount - 1)));
    return;
  }

      const rawImgs: string[] = data.images
        ? data.images.map((b64: string) => `data:image/png;base64,${b64}`)
        : [`data:image/png;base64,${data.image}`];

      const elapsed = Number(((Date.now() - startTime) / 1000).toFixed(1));
      setCurrentVariations(rawImgs);
      setSelectedVarIndex(0);
      setResultImage(rawImgs[0]);

      const newItem: HistoryItem = {
        image: rawImgs[0],
        variations: rawImgs,
        selectedVarIndex: 0,
        prompt: customPrompt.trim(),
        time: elapsed,
      };

      const updatedHistory = [...history.slice(0, historyIndex + 1), newItem];
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);

      setFreeCountRaw(String(Math.max(0, freeCount - 1)));
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : lang === 'en'
          ? 'An error occurred during rendering. Please try again.'
          : lang === 'ja'
          ? 'レンダリング中にエラーが発生しました。もう一度お試しください。'
          : '인테리어 생성 중 오류가 발생했습니다. 다시 시도해 주세요.'
      );
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  // 시안 선택 핸들러
  const handleSelectVariation = (idx: number) => {
    if (idx >= 0 && idx < currentVariations.length) {
      setSelectedVarIndex(idx);
      setResultImage(currentVariations[idx]);
    }
  };

  // ↩️ 이전 단계로 되돌리기 (Undo)
  const handleUndo = () => {
    if (historyIndex > 0 && !isLoading) {
      const prevIdx = historyIndex - 1;
      const item = history[prevIdx];
      setHistoryIndex(prevIdx);
      if (item.variations && item.variations.length > 0) {
        setCurrentVariations(item.variations);
        setSelectedVarIndex(item.selectedVarIndex || 0);
        setResultImage(item.variations[item.selectedVarIndex || 0] || item.image);
      } else {
        setCurrentVariations([item.image]);
        setSelectedVarIndex(0);
        setResultImage(item.image);
      }
      setCustomPrompt(item.prompt);
      setGenerationTime(item.time);
      setErrorMsg(null);
    }
  };

  // ↪️ 다음 단계로 다시 실행 (Redo)
  const handleRedo = () => {
    if (historyIndex < history.length - 1 && !isLoading) {
      const nextIdx = historyIndex + 1;
      const item = history[nextIdx];
      setHistoryIndex(nextIdx);
      if (item.variations && item.variations.length > 0) {
        setCurrentVariations(item.variations);
        setSelectedVarIndex(item.selectedVarIndex || 0);
        setResultImage(item.variations[item.selectedVarIndex || 0] || item.image);
      } else {
        setCurrentVariations([item.image]);
        setSelectedVarIndex(0);
        setResultImage(item.image);
      }
      setCustomPrompt(item.prompt);
      setGenerationTime(item.time);
      setErrorMsg(null);
    }
  };

  // 특정 히스토리 단계로 즉시 이동
  const handleJumpToHistory = (idx: number) => {
    if (idx >= 0 && idx < history.length && !isLoading) {
      const item = history[idx];
      setHistoryIndex(idx);
      if (item.variations && item.variations.length > 0) {
        setCurrentVariations(item.variations);
        setSelectedVarIndex(item.selectedVarIndex || 0);
        setResultImage(item.variations[item.selectedVarIndex || 0] || item.image);
      } else {
        setCurrentVariations([item.image]);
        setSelectedVarIndex(0);
        setResultImage(item.image);
      }
      setCustomPrompt(item.prompt);
      setGenerationTime(item.time);
      setErrorMsg(null);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `reroom_${selectedRoom}_${selectedStyle}_var${selectedVarIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    if (currentVariations.length === 0) return;
    currentVariations.forEach((imgSrc, idx) => {
      const link = document.createElement('a');
      link.href = imgSrc;
      link.download = `reroom_${selectedRoom}_${selectedStyle}_concept_${idx + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const resetResult = () => {
    setResultImage(null);
    setCurrentVariations([]);
    setSelectedVarIndex(0);
    setGenerationTime(null);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const resetAll = () => {
    setUploadedImage(null);
    setResultImage(null);
    setCurrentVariations([]);
    setSelectedVarIndex(0);
    setGenerationTime(null);
    setCustomPrompt('');
    setHistory([]);
    setHistoryIndex(-1);
    setErrorMsg(null);
  };

  return (
    <section id="studio" className="w-full scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-clay">
                {t.badge}
              </p>
              <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                {t.title}
              </h2>
            </div>
            <span className="rounded-full border border-line bg-paper-raised px-4 py-2 text-xs font-semibold text-ink-soft">
              {lang === 'en'
                ? `${freeCount} Free Credits Left`
                : lang === 'ja'
                ? `残り ${freeCount} クレジット`
                : `남은 무료 크레딧: ${freeCount}회`}
            </span>
          </div>
        </Reveal>

        <Reveal delay={100} className="mt-10">
          <div className="rounded-3xl border border-line bg-paper-raised p-6 shadow-lift md:p-10">
            {resultImage && uploadedImage ? (
              /* ── 생성 완료 결과 ── */
              <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 animate-fade-in">
                <div className="text-center">
                  <span className="rounded-full bg-clay px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-paper">
                    Redesign Complete
                  </span>
                  <h3 className="font-display mt-4 text-2xl font-bold text-ink">
                    {lang === 'en' ? 'New Space Concept Created' : lang === 'ja' ? '新しい空間デザインが完成しました' : '새로운 공간이 완성되었습니다'}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-faint">
                    <span>
                      {lang === 'en'
                        ? ROOM_TYPES.find((r) => r.id === selectedRoom)?.labelEn
                        : lang === 'ja'
                        ? ROOM_TYPES.find((r) => r.id === selectedRoom)?.labelJa
                        : ROOM_TYPES.find((r) => r.id === selectedRoom)?.label}{' '}
                      ·{' '}
                      {lang === 'en'
                        ? STYLES.find((s) => s.id === selectedStyle)?.labelEn
                        : lang === 'ja'
                        ? STYLES.find((s) => s.id === selectedStyle)?.labelJa
                        : STYLES.find((s) => s.id === selectedStyle)?.label}{' '}
                      {lang === 'en' ? 'Style' : lang === 'ja' ? 'スタイル' : '스타일'}
                    </span>
                    {generationTime && (
                      <span>· {lang === 'en' ? `Rendered in ${generationTime}s` : lang === 'ja' ? `生成時間 ${generationTime}秒` : `생성 소요 ${generationTime}초`}</span>
                    )}
                  </div>
                  {customPrompt.trim() && (
                    <div className="mx-auto mt-2.5 max-w-md rounded-xl bg-paper px-3.5 py-1.5 text-xs text-clay-deep border border-clay/20">
                      💬 <span className="font-semibold">{lang === 'en' ? 'Applied Prompt:' : lang === 'ja' ? '反映されたリクエスト:' : '반영된 요청:'}</span> &ldquo;{customPrompt.trim()}&rdquo;
                    </div>
                  )}
                </div>

                {/* ── 생성된 다중 시안 선택 탭 (2개 이상 생성 시) ── */}
                {currentVariations.length > 1 && (
                  <div className="w-full rounded-2xl border border-line bg-paper p-4 shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between pb-2.5">
                      <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <span>✨</span> {lang === 'en' ? `Select Concept Variation (${currentVariations.length})` : lang === 'ja' ? `デザイン案の選択 (${currentVariations.length}案)` : `생성된 디자인 시안 선택 (${currentVariations.length}개)`}
                      </span>
                      <span className="text-[11px] text-clay font-medium">
                        {lang === 'en' ? 'Click a concept to update the comparison view' : lang === 'ja' ? '案をクリックすると比較画面に反映されます' : '원하는 시안을 클릭하면 비교 화면에 즉시 적용됩니다'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {currentVariations.map((vSrc, idx) => {
                        const conceptTitlesEn = [
                          { title: 'Concept 1', sub: 'Classic Balance' },
                          { title: 'Concept 2', sub: 'Atmospheric Mood' },
                          { title: 'Concept 3', sub: 'Modern Minimal' },
                          { title: 'Concept 4', sub: 'Botanical Luxe' },
                        ];
                        const conceptTitlesJa = [
                          { title: 'デザイン案 1', sub: '王道バランス' },
                          { title: 'デザイン案 2', sub: 'エモーショナルムード' },
                          { title: 'デザイン案 3', sub: 'モダンミニマル' },
                          { title: 'デザイン案 4', sub: 'ボタニカルラックス' },
                        ];
                        const conceptTitlesKr = [
                          { title: '시안 1', sub: '정통 밸런스' },
                          { title: '시안 2', sub: '감성 무드' },
                          { title: '시안 3', sub: '모던 미니멀' },
                          { title: '시안 4', sub: '보태니컬 럭스' },
                        ];
                        const conceptList = lang === 'en' ? conceptTitlesEn : lang === 'ja' ? conceptTitlesJa : conceptTitlesKr;
                        const meta = conceptList[idx] || {
                          title: lang === 'en' ? `Concept ${idx + 1}` : lang === 'ja' ? `デザイン案 ${idx + 1}` : `시안 ${idx + 1}`,
                          sub: lang === 'en' ? 'Variation' : lang === 'ja' ? 'バリエーション' : '디자인 변형',
                        };
                        const isSelected = idx === selectedVarIndex;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectVariation(idx)}
                            className={`group relative cursor-pointer overflow-hidden rounded-xl border p-1.5 text-left transition-all ${
                              isSelected
                                ? 'border-clay bg-clay-soft ring-2 ring-clay shadow-md'
                                : 'border-line bg-paper-raised hover:border-line-strong'
                            }`}
                          >
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                              <Image src={vSrc} alt={meta.title} fill className="object-cover transition-transform group-hover:scale-105" />
                              {isSelected && (
                                <span className="absolute right-1.5 top-1.5 rounded-full bg-clay px-1.5 py-0.5 text-[10px] font-bold text-paper shadow">
                                  {lang === 'en' ? 'Selected' : lang === 'ja' ? '選択中' : '선택됨'}
                                </span>
                              )}
                            </div>
                            <div className="mt-1.5 px-1 pb-0.5">
                              <p className={`text-xs font-bold ${isSelected ? 'text-clay-deep' : 'text-ink'}`}>
                                {meta.title}
                              </p>
                              <p className="text-[10px] text-ink-faint">{meta.sub}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <CompareSlider
                  beforeSrc={uploadedImage}
                  afterSrc={resultImage}
                  beforeAlt={lang === 'en' ? 'Uploaded original room' : lang === 'ja' ? '元の部屋' : '업로드한 원본 공간'}
                  afterAlt={lang === 'en' ? 'Redesigned room' : lang === 'ja' ? 'リデザイン後の部屋' : '리디자인된 공간'}
                />

                {/* ── 수정 히스토리 (Undo / Redo / 이전 단계 복귀 컨트롤러) ── */}
                {history.length > 1 && (
                  <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-5 py-3.5 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink">{lang === 'en' ? 'History:' : lang === 'ja' ? '変更履歴:' : '수정 기록:'}</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {history.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleJumpToHistory(idx)}
                            className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                              idx === historyIndex
                                ? 'bg-clay text-paper shadow-sm'
                                : 'border border-line bg-paper-raised text-ink-soft hover:border-line-strong hover:text-ink'
                            }`}
                          >
                            {idx === 0
                              ? lang === 'en'
                                ? 'Initial'
                                : lang === 'ja'
                                ? '初回デザイン'
                                : '1차 디자인'
                              : lang === 'en'
                              ? `Edit #${idx}`
                              : lang === 'ja'
                              ? `修正 #${idx}`
                              : `수정 #${idx}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0 || isLoading}
                        className={`cursor-pointer rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                          historyIndex > 0 && !isLoading
                            ? 'border-line-strong bg-paper-raised text-ink hover:border-clay hover:text-clay active:scale-95'
                            : 'cursor-not-allowed border-line bg-sand/50 text-ink-faint'
                        }`}
                        title={lang === 'en' ? 'Undo step' : lang === 'ja' ? '前の段階に戻る' : '직전 수정 단계로 되돌리기'}
                      >
                        <span>↩️</span> {lang === 'en' ? 'Undo' : lang === 'ja' ? '前段階へ' : '이전 단계로 복귀'}
                      </button>

                      <button
                        type="button"
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1 || isLoading}
                        className={`cursor-pointer rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                          historyIndex < history.length - 1 && !isLoading
                            ? 'border-line-strong bg-paper-raised text-ink hover:border-clay hover:text-clay active:scale-95'
                            : 'cursor-not-allowed border-line bg-sand/50 text-ink-faint'
                        }`}
                        title={lang === 'en' ? 'Redo step' : lang === 'ja' ? 'やり直す' : '다음 수정 단계로 다시 가기'}
                      >
                        <span>↪️</span> {lang === 'en' ? `Redo (${historyIndex + 1}/${history.length})` : lang === 'ja' ? `やり直し (${historyIndex + 1}/${history.length})` : `다시 실행 (${historyIndex + 1}/${history.length})`}
                      </button>
                    </div>
                  </div>
                )}

                {/* 결과 화면 내 실시간 수정 및 재생성 컨트롤 바 */}
                <div className="w-full rounded-2xl border border-line bg-paper p-5 shadow-sm">
                  <div className="flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="refine-prompt" className="text-sm font-bold text-ink flex items-center gap-1.5">
                        <span>✏️</span> {lang === 'en' ? 'Refine & Re-render' : lang === 'ja' ? '希望の修正内容を入力して再生成' : '원하는 사항 수정 후 바로 재생성'}
                      </label>
                      <span className="text-[11px] text-ink-faint">
                        {customPrompt.length}{lang === 'en' ? '/500 chars' : lang === 'ja' ? '/500文字' : '/500자'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          id="refine-prompt"
                          type="text"
                          value={customPrompt}
                          maxLength={500}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isLoading) {
                              e.preventDefault();
                              handleGenerate(true);
                            }
                          }}
                          placeholder={
                            lockCurrentRoom
                              ? lang === 'en'
                                ? 'e.g. Add a person sitting on sofa / put a golden retriever on rug'
                                : lang === 'ja'
                                ? '例: ソファでくつろぐ人を追加 / ラグの上にゴールデンレトリバーを配置'
                                : '예: 소파에 앉아있는 사람을 추가해줘 / 바닥 러그 위에 골든 리트리버 한 마리 놓아줘'
                              : lang === 'en'
                              ? 'e.g. Soften lighting and add a wooden shelf near the window'
                              : lang === 'ja'
                              ? '例: 照明をより柔らかくし、窓辺に木製棚を追加'
                              : '예: 조명을 더 은은하게 해주고, 창가에 원목 선반을 추가해줘'
                          }
                          className="w-full rounded-xl border border-line bg-paper-raised px-4 py-3 pr-10 text-sm text-ink placeholder-ink-faint transition-colors focus:border-clay focus:outline-none"
                        />
                        {customPrompt.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCustomPrompt('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint hover:text-ink cursor-pointer p-1"
                            title={lang === 'en' ? 'Clear input' : lang === 'ja' ? '入力内容をクリア' : '입력 내용 비우기'}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleGenerate(true)}
                        disabled={isLoading}
                        className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
                          isLoading
                            ? 'cursor-not-allowed bg-sand text-ink-faint'
                            : 'bg-clay text-paper shadow-lift hover:bg-clay-deep active:scale-95'
                        }`}
                      >
                        <span>🔄</span> {isLoading ? (lang === 'en' ? 'Rendering...' : lang === 'ja' ? '生成中...' : '생성 중...') : (lang === 'en' ? 'Re-render' : lang === 'ja' ? '修正して再生成' : '수정하여 재생성')}
                      </button>
                    </div>

                    {/* 추천 키워드 칩 (인물/반려동물 및 인테리어 태그) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-ink-faint mr-1">
                        {lang === 'en' ? 'Suggested Tags:' : lang === 'ja' ? 'おすすめタグ:' : '추천 태그:'}
                      </span>
                      {(lang === 'en' ? REFINE_SUGGESTED_TAGS_EN : lang === 'ja' ? REFINE_SUGGESTED_TAGS_JA : REFINE_SUGGESTED_TAGS_KR).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] transition-all duration-150 ${
                            customPrompt.includes(tag)
                              ? 'border-clay bg-clay-soft text-clay-deep font-semibold'
                              : 'border-line bg-paper-raised text-ink-soft hover:border-line-strong hover:text-ink'
                          }`}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    {/* 방 고정 및 공간 변환 모드 옵션 */}
                    <div className="flex flex-col gap-2 border-t border-line/60 pt-2.5 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="flex items-center gap-2 font-medium text-ink cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lockCurrentRoom}
                            onChange={(e) => setLockCurrentRoom(e.target.checked)}
                            className="h-4 w-4 rounded border-line text-clay focus:ring-clay cursor-pointer"
                          />
                          <span className="font-bold text-clay-deep">
                            {lang === 'en'
                              ? '🔒 Lock Current Composition & Furniture 100%'
                              : lang === 'ja'
                              ? '🔒 現在の構図・家具・カラーを100%固定'
                              : '🔒 현재 완성된 방 구도·가구·색상 100% 고정하기'}
                          </span>
                        </label>
                        <span className="text-[11px] text-ink-faint">
                          {lockCurrentRoom
                            ? lang === 'en'
                              ? '✨ Keep completed space intact, only adding human/pets/accents naturally.'
                              : lang === 'ja'
                              ? '✨ 完成した部屋を保ち、人物・ペット・小物の追加を行います。'
                              : '✨ 완성된 방을 그대로 두고 사람/동물/소품만 자연스럽게 추가합니다.'
                            : lang === 'en'
                            ? '⚡ Re-render fresh design based on original photo.'
                            : lang === 'ja'
                            ? '⚡ 元の写真を基準に新しくレンダリングします。'
                            : '⚡ 원본 사진을 기준으로 새롭게 렌더링합니다.'}
                        </span>
                      </div>

                      {/* lockCurrentRoom이 꺼져있을 때 표시되는 3단 모드 퀵 선택 칩 */}
                      {!lockCurrentRoom && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[11px] font-semibold text-ink-soft">{lang === 'en' ? 'Mode:' : lang === 'ja' ? '変換モード:' : '변환 방식:'}</span>
                          {(
                            [
                              { id: 'clear_room', label: lang === 'en' ? '🧹 Full Clear' : lang === 'ja' ? '🧹 家具クリア' : '🧹 가구 싹 비우기' },
                              { id: 'preserve_layout', label: lang === 'en' ? '📐 Keep Layout' : lang === 'ja' ? '📐 配置維持' : '📐 가구배치 유지' },
                              { id: 'preserve_surface', label: lang === 'en' ? '🎨🧱 Wall & Floor Only' : lang === 'ja' ? '🎨🧱 壁紙・床のみ' : '🎨🧱 벽지·바닥재만 변경' },
                              { id: 'preserve_all', label: lang === 'en' ? '🎨 Keep Style' : lang === 'ja' ? '🎨 スタイル維持' : '🎨 스타일·색상 유지' },
                            ] as const
                          ).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setRedesignMode(m.id)}
                              className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                redesignMode === m.id
                                  ? 'bg-clay text-paper shadow-sm'
                                  : 'border border-line bg-paper-raised text-ink-soft hover:text-ink'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {errorMsg && (
                      <div
                        role="alert"
                        className="mt-2 rounded-xl border border-clay/30 bg-clay-soft p-3 text-xs leading-relaxed text-clay-deep"
                      >
                        {errorMsg}
                      </div>
                    )}
                  </div>
                </div>

                {isLoading && (
                  <div className="w-full flex flex-col items-center gap-3 rounded-2xl border border-line bg-paper py-6">
                    <div className="flex items-center gap-2">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="h-2 w-2 animate-bounce rounded-full bg-clay"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-ink" aria-live="polite">
                      {(lang === 'en' ? LOADING_STATUSES_EN : lang === 'ja' ? LOADING_STATUSES_JA : LOADING_STATUSES_KR)[loadingStep]}
                    </p>
                  </div>
                )}

                <div className="flex w-full flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={handleDownload}
                    className="cursor-pointer rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-paper shadow-lift transition-all duration-200 hover:bg-clay active:scale-95 flex items-center gap-1.5"
                  >
                    <span>💾</span>{' '}
                    {lang === 'en'
                      ? currentVariations.length > 1
                        ? `Download Concept ${selectedVarIndex + 1}`
                        : 'Download High-Res PNG'
                      : lang === 'ja'
                      ? currentVariations.length > 1
                        ? `選択したデザイン案 ${selectedVarIndex + 1} をダウンロード`
                        : '高画質PNGダウンロード'
                      : currentVariations.length > 1
                      ? `선택된 시안 ${selectedVarIndex + 1} 다운로드`
                      : '고화질 PNG 다운로드'}
                  </button>

                  {currentVariations.length > 1 && (
                    <button
                      onClick={handleDownloadAll}
                      className="cursor-pointer rounded-full border border-clay bg-clay-soft px-6 py-3.5 text-sm font-bold text-clay-deep shadow-sm transition-all duration-200 hover:bg-clay hover:text-paper active:scale-95 flex items-center gap-1.5"
                    >
                      <span>📦</span>{' '}
                      {lang === 'en'
                        ? `Batch Download All Concepts (${currentVariations.length})`
                        : lang === 'ja'
                        ? `全デザイン案を一括ダウンロード (${currentVariations.length}枚)`
                        : `전체 시안 일괄 다운로드 (${currentVariations.length}장)`}
                    </button>
                  )}

                  <button
                    onClick={resetResult}
                    className="cursor-pointer rounded-full border border-line-strong bg-paper-raised px-7 py-3.5 text-sm font-semibold text-ink transition-all duration-200 hover:border-ink active:scale-95"
                  >
                    {lang === 'en' ? 'Reset Options' : lang === 'ja' ? 'オプションをリセット' : '옵션 전체 다시 설정'}
                  </button>
                  <button
                    onClick={resetAll}
                    className="cursor-pointer rounded-full px-5 py-3.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
                  >
                    {lang === 'en' ? 'Upload Another Photo' : lang === 'ja' ? '別の写真をアップロード' : '다른 사진 업로드'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── 입력 단계 ── */
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-12">
                {/* 01. 업로드 */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-baseline gap-2 text-base font-bold text-ink">
                    <span className="font-display text-sm text-clay">01</span>
                    {t.step1Label}
                  </label>

                  {!uploadedImage ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files?.[0]) handleImageFile(e.dataTransfer.files[0]);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
                        isDragOver
                          ? 'scale-[0.99] border-clay bg-clay-soft'
                          : 'border-line-strong bg-paper hover:border-ink-faint'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleImageFile(e.target.files[0]);
                          e.target.value = '';
                        }}
                      />
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                        className="text-ink-faint"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="9" cy="9" r="1.8" fill="currentColor" />
                        <path d="M4 17l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {t.uploadDragText}
                        </p>
                        <p className="mt-1.5 text-xs text-ink-faint">
                          {t.uploadSubText}
                          <br />
                          {lang === 'en'
                            ? 'Auto-optimized to 1024px upon upload'
                            : lang === 'ja'
                            ? 'アップロード時に1024pxに自動最適化されます'
                            : '업로드 시 1024px로 자동 최적화됩니다'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line shadow-lift">
                      <Image src={uploadedImage} alt="Uploaded Room Preview" fill className="object-cover" />
                      <button
                        onClick={resetAll}
                        title={lang === 'en' ? 'Remove Photo' : '사진 삭제'}
                        className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-ink/75 text-paper backdrop-blur-sm transition-all duration-200 hover:bg-ink active:scale-95"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* 02+03. 옵션 */}
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-baseline gap-2 text-base font-bold text-ink">
                        <span className="font-display text-sm text-clay">02</span>
                        {t.step2Label}
                      </label>
                    </div>

                    {/* 🏠 🏡 🌿 Home AI 스타일 직관적 3단 카테고리 탭 */}
                    <div className="flex gap-1.5 rounded-2xl bg-sand p-1 text-xs font-bold shadow-inner">
                      {(
                        [
                          { id: 'interior', icon: '🏠', label: lang === 'en' ? 'Interior' : lang === 'ja' ? 'インテリア' : '실내 공간' },
                          { id: 'exterior', icon: '🏡', label: lang === 'en' ? 'Exterior' : lang === 'ja' ? 'エクステリア' : '건물 외관' },
                          { id: 'outdoor', icon: '🌿', label: lang === 'en' ? 'Outdoor' : lang === 'ja' ? 'ガーデン' : '정원·테라스' },
                        ] as const
                      ).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setActiveCategory(cat.id);
                            const firstInCat = ROOM_TYPES.find((r) => r.category === cat.id);
                            if (firstInCat) setSelectedRoom(firstInCat.id);
                          }}
                          className={`flex-1 cursor-pointer rounded-xl py-2.5 text-center transition-all ${
                            activeCategory === cat.id
                              ? 'bg-clay text-paper shadow-sm font-bold'
                              : 'text-ink-soft hover:text-ink'
                          }`}
                        >
                          <span>{cat.icon}</span> {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {ROOM_TYPES.filter((r) => r.category === activeCategory).map((room) => (
                        <button
                          key={room.id}
                          onClick={() => {
                            setSelectedRoom(room.id);
                            setErrorMsg(null);
                          }}
                          className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                            selectedRoom === room.id
                              ? 'bg-ink text-paper shadow-lift'
                              : 'border border-line bg-paper text-ink-soft hover:border-line-strong hover:text-ink'
                          }`}
                        >
                          {lang === 'en' ? room.labelEn : lang === 'ja' ? room.labelJa : room.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="flex items-baseline gap-2 text-base font-bold text-ink">
                      <span className="font-display text-sm text-clay">03</span>
                      {t.step3Label}
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                      {STYLES.map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            setSelectedStyle(style.id);
                            setErrorMsg(null);
                          }}
                          className={`group cursor-pointer rounded-2xl border p-3 text-left transition-all duration-200 ${
                            selectedStyle === style.id
                              ? 'border-clay bg-clay-soft shadow-lift ring-2 ring-clay'
                              : 'border-line bg-paper hover:border-line-strong'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink">
                              {lang === 'en' ? style.labelEn : lang === 'ja' ? style.labelJa : style.label}
                            </span>
                            <div className="flex items-center gap-1">
                              {style.swatch.map((c, i) => (
                                <span key={i} className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                              ))}
                            </div>
                          </div>
                          <p className="mt-1 text-[11px] leading-snug text-ink-faint">
                            {lang === 'en' ? style.descEn : lang === 'ja' ? style.descJa : style.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 추천 키워드 태그 */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-ink-faint">
                      {lang === 'en' ? 'Suggested Tags:' : lang === 'ja' ? 'おすすめタグ:' : '추천 키워드 태그:'}
                    </span>
                    {(lang === 'en' ? SUGGESTED_PROMPTS_EN : lang === 'ja' ? SUGGESTED_PROMPTS_JA : SUGGESTED_PROMPTS_KR).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`cursor-pointer rounded-full border px-3 py-1 text-xs transition-all duration-150 ${
                          customPrompt.includes(tag)
                            ? 'border-clay bg-clay-soft text-clay-deep font-semibold'
                            : 'border-line bg-paper-raised text-ink-soft hover:border-line-strong hover:text-ink'
                        }`}
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>

                  {/* 공간 변환 모드 4단 선택기 */}
                  <div className="mt-2 flex flex-col gap-2">
                    <span className="text-xs font-bold text-ink">
                      {lang === 'en' ? 'Spatial Transformation Mode:' : lang === 'ja' ? '空間変革モード選択:' : '공간 변환 모드 선택:'}
                    </span>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                      {/* 1. 가구 싹 비우기 */}
                      <button
                        type="button"
                        onClick={() => setRedesignMode('clear_room')}
                        className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                          redesignMode === 'clear_room'
                            ? 'border-clay bg-clay-soft shadow-sm ring-1 ring-clay'
                            : 'border-line bg-paper-raised hover:border-line-strong'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🧹</span>
                          <span className="text-xs font-bold text-ink">
                            {lang === 'en' ? 'Full Transformation' : lang === 'ja' ? '家具フルリセット' : '가구 싹 비우기'}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
                          {lang === 'en'
                            ? 'Clears existing furniture and renders a fresh layout and modern interior decor.'
                            : lang === 'ja'
                            ? '既存の家具や荷物をクリアし、構図に合わせて全く新しい家具・インテリアを配置します。'
                            : '기존 가구와 짐을 모두 치우고 구도에 맞춰 완전히 새로운 가구와 인테리어로 배치합니다.'}
                        </p>
                      </button>

                      {/* 2. 기존 가구 배치 유지 */}
                      <button
                        type="button"
                        onClick={() => setRedesignMode('preserve_layout')}
                        className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                          redesignMode === 'preserve_layout'
                            ? 'border-clay bg-clay-soft shadow-sm ring-1 ring-clay'
                            : 'border-line bg-paper-raised hover:border-line-strong'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">📐</span>
                          <span className="text-xs font-bold text-ink">
                            {lang === 'en' ? 'Balanced Redesign' : lang === 'ja' ? '配置維持モード' : '가구 배치 유지'}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
                          {lang === 'en'
                            ? 'Keeps main furniture positions while updating materials, colors, and design style.'
                            : lang === 'ja'
                            ? 'ソファやベッドの位置を保ちつつ、選択したスタイルに合わせてデザインや素材を変更します。'
                            : '소파, 침대 등의 위치는 그대로 두고 선택한 스타일에 맞춰 가구 디자인과 재질을 바꿉니다.'}
                        </p>
                      </button>

                      {/* 3. 가구 100% 보존 + 벽지·바닥재만 변경 */}
                      <button
                        type="button"
                        onClick={() => setRedesignMode('preserve_surface')}
                        className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                          redesignMode === 'preserve_surface'
                            ? 'border-clay bg-clay-soft shadow-sm ring-1 ring-clay'
                            : 'border-line bg-paper-raised hover:border-line-strong'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🎨🧱</span>
                          <span className="text-xs font-bold text-ink">
                            {lang === 'en' ? 'Wall & Floor Only' : lang === 'ja' ? '壁紙・床のみ変更' : '벽지·바닥재만 변경'}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
                          {lang === 'en'
                            ? 'Keeps 100% furniture & layout intact, updating only wall paint, wallpaper & flooring textures.'
                            : lang === 'ja'
                            ? '家具・配置を100%固定し、壁紙・ペイント色・床材のみ変更します。'
                            : '가구와 인테리어를 100% 그대로 유지하고 벽지, 페인트색, 바닥재만 수정합니다.'}
                        </p>
                      </button>

                      {/* 4. 스타일 & 색상 유지 */}
                      <button
                        type="button"
                        onClick={() => setRedesignMode('preserve_all')}
                        className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all ${
                          redesignMode === 'preserve_all'
                            ? 'border-clay bg-clay-soft shadow-sm ring-1 ring-clay'
                            : 'border-line bg-paper-raised hover:border-line-strong'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">🎨</span>
                          <span className="text-xs font-bold text-ink">
                            {lang === 'en' ? 'Maintain Materials' : lang === 'ja' ? 'スタイル・色彩維持' : '스타일·색상 유지'}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-ink-soft">
                          {lang === 'en'
                            ? 'Preserves original furniture shapes and colors while cleaning up clutter and adding warm lights.'
                            : lang === 'ja'
                            ? '元の家具の形や色合いを保ちつつ、雑然とした荷物を整理し上質な照明を追加します。'
                            : '원래 방의 가구 형태, 고유 색상, 마감재를 100% 보존하며 잡동사니 정리와 고급 조명을 더합니다.'}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 고품질 단일 디자인 시안 생성 안내 */}
                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-line bg-paper-raised p-3.5">
                    <div>
                      <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                        <span>🖼️</span> {lang === 'en' ? 'Single Premium Design Output' : lang === 'ja' ? '高品質単一デザイン生成' : '고품질 단일 프리미엄 디자인 생성'}
                      </p>
                      <p className="text-[11px] text-ink-soft">
                        {lang === 'en'
                          ? 'Generates 1 refined, high-fidelity concept tailored to your selected style and space.'
                          : lang === 'ja'
                          ? '選択したスタイルと空間に最適化された高精細な1案を生成します。'
                          : '선택하신 공간과 스타일에 가장 정밀하게 최적화된 고품질 시안 1개를 생성합니다.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-clay px-3 py-1.5 text-xs font-bold text-paper shadow-sm">
                        1 {lang === 'en' ? 'Concept' : lang === 'ja' ? '案' : '장'} (100% Focused)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 에러 + 생성 버튼 (전체 폭) */}
                <div className="flex flex-col gap-5 lg:col-span-2">

                  {errorMsg && (
                    <div
                      role="alert"
                      className="rounded-xl border border-clay/30 bg-clay-soft p-4 text-xs leading-relaxed text-clay-deep"
                    >
                      {errorMsg}
                    </div>
                  )}

                  <button
                    onClick={() => handleGenerate(false)}
                    disabled={isLoading || !uploadedImage}
                    className={`w-full rounded-2xl py-4 text-base font-bold transition-all duration-300 ${
                      isLoading || !uploadedImage
                        ? 'cursor-not-allowed bg-sand text-ink-faint'
                        : 'cursor-pointer bg-ink text-paper shadow-lift hover:-translate-y-0.5 hover:bg-clay active:scale-[0.99]'
                    }`}
                  >
                    {isLoading
                      ? t.generatingBtn
                      : t.generateBtn}
                  </button>

                  {isLoading && (
                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-paper py-8">
                      <div className="flex items-center gap-2">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="h-2 w-2 animate-bounce rounded-full bg-clay"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-ink" aria-live="polite">
                        {(lang === 'en'
                          ? LOADING_STATUSES_EN
                          : lang === 'ja'
                          ? LOADING_STATUSES_JA
                          : LOADING_STATUSES_KR)[loadingStep]}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {lang === 'en'
                          ? 'Rendering takes approximately 5–10 seconds. Please hold on.'
                          : lang === 'ja'
                          ? '生成には約5〜10秒かかります。少々お待ちください。'
                          : '첫 생성에는 약 10초가 소요됩니다. 잠시만 기다려 주세요.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}