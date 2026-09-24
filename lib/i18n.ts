// 🌐 RoomFit AI Multi-Language (i18n) System
// Supported: English ('en' - Default), Korean ('ko'), Japanese ('ja'), Spanish ('es')

export type Language = 'en' | 'ko' | 'ja' | 'es';

export interface LanguageOption {
  code: Language;
  flag: string;
  label: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', flag: '🇺🇸', label: 'English', nativeName: 'English' },
  { code: 'ko', flag: '🇰🇷', label: 'Korean', nativeName: '한국어' },
  { code: 'ja', flag: '🇯🇵', label: 'Japanese', nativeName: '日本語' },
  { code: 'es', flag: '🇪🇸', label: 'Spanish', nativeName: 'Español' },
];

export const translations = {
  header: {
    brand: { en: 'RoomFit AI', ko: 'RoomFit AI', ja: 'RoomFit AI', es: 'RoomFit AI' },
    freeBadge: {
      en: '🎁 2 Free Trials',
      ko: '🎁 신규 2회 무료 지급',
      ja: '🎁 新規2回無料付与',
      es: '🎁 2 Pruebas Gratis',
    },
    credits: { en: 'Credits', ko: '크레딧', ja: 'クレジット', es: 'Créditos' },
    langSelectTitle: {
      en: 'Select Language',
      ko: '언어 선택',
      ja: '言語を選択',
      es: 'Seleccionar Idioma',
    },
  },
  pricing: {
    title: {
      en: '💎 Choose Membership Plan',
      ko: '💎 멤버십 요금제 선택',
      ja: '💎 メンバーシッププランを選択',
      es: '💎 Elige tu Plan de Membresía',
    },
    tryBeforeBuy: {
      en: '2 free trials available before purchase',
      ko: '결제 전 2회 무료 체험 가능',
      ja: '購入前に2回無料でお試し可能',
      es: 'Prueba 2 veces gratis antes de comprar',
    },
    before: { en: 'BEFORE', ko: 'BEFORE', ja: 'BEFORE', es: 'BEFORE' },
    after: { en: 'AFTER', ko: 'AFTER', ja: 'AFTER', es: 'AFTER' },
    plans: {
      starter: {
        name: { en: 'Starter Pack', ko: '스타터 팩', ja: 'スターターパック', es: 'Paquete Starter' },
        badge: { en: 'Budget', ko: '알뜰형', ja: 'お得', es: 'Económico' },
        creditsText: { en: '30 Credits', ko: '30 크레딧', ja: '30クレジット', es: '30 Créditos' },
        periodText: { en: 'One-time recharge', ko: '1회 충전', ja: '買い切りチャージ', es: 'Recarga única' },
        tagline: {
          en: 'One-time recharge for 1-2 rooms remodel',
          ko: '1~2개 방 리모델링용 1회성 충전',
          ja: '1〜2部屋のリフォーム用買い切りチャージ',
          es: 'Recarga única para remodelar 1-2 habitaciones',
        },
      },
      amateur: {
        name: { en: 'Amateur Pack', ko: '아마추어 팩', ja: 'アマチュアパック', es: 'Paquete Amateur' },
        badge: { en: 'Monthly', ko: '월간 플랜', ja: '月間プラン', es: 'Plan Mensual' },
        creditsText: { en: '1 Month Pass', ko: '1개월 무제한', ja: '1ヶ月無制限', es: '1 Mes Ilimitado' },
        periodText: { en: '$12.99 / month', ko: '$12.99 / 월', ja: '$12.99 / 月', es: '$12.99 / mes' },
        tagline: {
          en: 'Unlimited interior design for a whole month',
          ko: '한 달간 부담없이 무제한 인테리어',
          ja: '1ヶ月間存分に無制限インテリアデザイン',
          es: 'Diseño interior ilimitado por un mes entero',
        },
      },
      pro: {
        name: { en: 'Pro Pack', ko: '프로 팩', ja: 'プロパック', es: 'Paquete Pro' },
        badge: { en: 'BEST VALUE', ko: '인기 BEST', ja: '人気BEST', es: 'MEJOR VALOR' },
        creditsText: { en: '3 Months Pass', ko: '3개월 무제한', ja: '3ヶ月無制限', es: '3 Meses Ilimitado' },
        periodText: { en: '$6.66 / mo', ko: '월 $6.66', ja: '月額$6.66', es: '$6.66 / mes' },
        tagline: {
          en: 'Complete moving & renovation 3-month all-pass',
          ko: '이사 & 인테리어 완벽 완성 3개월 올패스',
          ja: '引越し＆リフォーム完全制覇 3ヶ月オールパス',
          es: 'Pase completo de 3 meses para mudanzas y reformas',
        },
      },
    },
    ctaStart: {
      en: 'Start {name} ({price})',
      ko: '{name} 시작하기 ({price})',
      ja: '{name}を始める ({price})',
      es: 'Iniciar {name} ({price})',
    },
    ctaFree: {
      en: 'Start immediately with 2 free trials ➔',
      ko: '신규 무료 2회 체험으로 바로 시작하기 ➔',
      ja: '新規2回無料体験ですぐ始める ➔',
      es: 'Comenzar de inmediato con 2 pruebas gratis ➔',
    },
    showcaseFeatures: [
      {
        id: 'interior',
        stepNum: '01',
        title: { en: 'Interior Redesign', ko: '실내인테리어 디자인', ja: 'インテリアデザイン', es: 'Rediseño de Interiores' },
        subtitle: {
          en: 'Complete stylish space transformation in 3 seconds from 1 photo',
          ko: '사진 1장으로 3초 만에 완성하는 감각적인 공간 재창조',
          ja: '写真1枚で3秒で完成するスタイリッシュな空間再創造',
          es: 'Transformación elegante del espacio en 3 segundos con 1 foto',
        },
      },
      {
        id: 'layout',
        stepNum: '02',
        title: { en: 'Spatial Layout Optimization', ko: '공간 레이아웃 최적화', ja: '空間レイアウト最適化', es: 'Optimización de Distribución' },
        subtitle: {
          en: '100% structural lock + smart furniture circulation flow',
          ko: '방 구조·벽체 100% 보존 + 가구 배치 스마트 최적화',
          ja: '部屋構造・壁を100%保持＋家具配置のスマート最適化',
          es: 'Estructura 100% intacta + flujo ergonómico de muebles',
        },
      },
      {
        id: 'replace',
        stepNum: '03',
        title: { en: 'Furniture & Decor Swap', ko: '가구 & 소품 스타일 교체', ja: '家具＆インテリアスタイル交換', es: 'Cambio de Muebles y Decoración' },
        subtitle: {
          en: 'Keep room structure, swap bespoke furniture & material',
          ko: '방 구조는 그대로, 원하는 가구 스타일 & 재질로 교체',
          ja: '部屋構造はそのまま、好みの家具スタイル＆素材に交換',
          es: 'Mantén la habitación y cambia muebles con tu estilo preferido',
        },
      },
      {
        id: 'exterior',
        stepNum: '04',
        title: { en: 'Architectural Exterior', ko: '건물 외관 디자인', ja: '建物外観・ファサード', es: 'Diseño Exterior y Fachada' },
        subtitle: {
          en: 'Preserve building massing + modern facade finishes & lighting',
          ko: '건물 형태는 고정한 채 최고급 외벽 마감재 & 파사드 변환',
          ja: '建物の骨組みは保持したまま、高級外壁仕上げ＆照明演出',
          es: 'Conserva la estructura con acabados modernos e iluminación',
        },
      },
      {
        id: 'garden',
        stepNum: '05',
        title: { en: 'Garden & Patio Landscape', ko: '정원 & 테라스 디자인', ja: '庭園・テラス造園デザイン', es: 'Jardín y Paisajismo de Terraza' },
        subtitle: {
          en: 'Outdoor perspective lock + pool & luxury greenery staging',
          ko: '야외 구도 보존 + 럭셔리 수영장 & 테라스 힐링 조경 연출',
          ja: '屋外構図保持＋プール＆テラスの高級リゾート造園演出',
          es: 'Conserva el paisaje con piscina y zonas verdes de lujo',
        },
      },
      {
        id: 'cleanup',
        stepNum: '06',
        title: { en: 'Clean Up & Declutter', ko: '청소 & 짐 정리 (클린업)', ja: 'お掃除＆片付け（クリーンアップ）', es: 'Limpieza y Despeje (Clean Up)' },
        subtitle: {
          en: 'Preserve interior, erase unwanted clutter & furniture',
          ko: '인테리어는 보존하고 지우고 싶은 가구와 잡동사니만 삭제',
          ja: '内装は保ったまま、不要な家具や散らかった荷物を消去',
          es: 'Mantén el diseño y elimina objetos o muebles no deseados',
        },
      },
      {
        id: 'paint',
        stepNum: '07',
        title: { en: 'Wall Paint & Floor Replace', ko: '벽지 & 페인트 교체', ja: '壁紙・ペイント・床材交換', es: 'Pintura de Paredes y Suelos' },
        subtitle: {
          en: 'Preserve furniture + 1-Tap wallpaper, paint & flooring swap',
          ko: '가구 보존 + 원하는 벽지 색상과 헤링본 바닥재 1-Tap 교체',
          ja: '家具保持＋好みの壁紙カラーやヘリンボーン床材に1タップ交換',
          es: 'Conserva muebles y cambia pintura o suelos con un toque',
        },
      },
    ],
  },
  home: {
    bannerTitle: {
      en: 'RoomFit AI Plans',
      ko: 'RoomFit AI 멤버십',
      ja: 'RoomFit AI プラン',
      es: 'Planes RoomFit AI',
    },
    bannerBtn: {
      en: 'View Plans',
      ko: '요금제 보기',
      ja: 'プランを見る',
      es: 'Ver Planes',
    },
    sectionTitle: {
      en: 'AI Design Tools',
      ko: 'AI 인테리어 변환 도구',
      ja: 'AIインテリアデザインツール',
      es: 'Herramientas de Diseño AI',
    },
    tools: {
      party_room: {
        title: { en: 'Party & Event Room', ko: '파티룸 & 이벤트 공간', ja: 'パーティールーム', es: 'Sala de Fiestas y Eventos' },
        desc: { en: 'Transform room into birthday, bridal shower & wine lounge from 1 photo', ko: '사진 1장으로 생일파티·브라이덜샤워·와인바 테마룸 완벽 스타일링', ja: '写真1枚で誕生日・ブライダル・ワインバー空間へ変身', es: 'Decora salas para cumpleaños, despedidas y fiestas temáticas' },
      },
      interior: {
        title: { en: 'Interior Redesign', ko: '실내 인테리어', ja: 'インテリアデザイン', es: 'Interiorismo' },
        desc: { en: 'Transform rooms into modern styles from 1 photo', ko: '사진 1장으로 완성하는 감각적인 공간 재창조', ja: '写真1枚で完成する空間スタイリング', es: 'Transforma espacios con estilos modernos' },
      },
      layout: {
        title: { en: 'Spatial Layout', ko: '공간 레이아웃', ja: '空間レイアウト', es: 'Distribución Espacial' },
        desc: { en: 'Lock walls & optimize 3D furniture arrangement', ko: '벽체 100% 보존 + 가구 배치 스마트 최적화', ja: '壁を完全に保持し家具配置を最適化', es: 'Conserva paredes y optimiza la distribución' },
      },
      replace: {
        title: { en: 'Furniture Swap', ko: '가구 스타일 교체', ja: '家具スタイル変更', es: 'Cambiar Muebles' },
        desc: { en: 'Pinpoint swap sofa, bed, or table style & material', ko: '방 구조 유지 + 소파·침대 등 가구 스타일 핀포인트 교체', ja: '部屋構造を維持しソファやベッドを個別交換', es: 'Cambia estilos de sofás, camas o mesas' },
      },
      exterior: {
        title: { en: 'Building Exterior', ko: '건물 외관', ja: '建物外観・ファサード', es: 'Exterior y Fachada' },
        desc: { en: 'Keep structure & upgrade luxury facade finishes', ko: '건물 형태 보존 + 최고급 외벽 마감재 및 조명 변환', ja: '建物の形を保ち高級外壁仕上げ＆照明演出', es: 'Actualiza fachadas y acabados arquitectónicos' },
      },
      garden: {
        title: { en: 'Garden & Patio', ko: '정원 / 테라스', ja: '庭園・テラス', es: 'Jardín y Terraza' },
        desc: { en: 'Landscape pools, plants & outdoor resort living', ko: '야외 구도 보존 + 럭셔리 수영장 & 테라스 힐링 조경', ja: '屋外リゾート造園＆プールテラス演出', es: 'Paisajismo, piscinas y zonas al aire libre' },
      },
      cleanup: {
        title: { en: 'Clean Up & Erase', ko: '청소 / 짐정리', ja: 'お掃除・片付け', es: 'Limpieza y Despeje' },
        desc: { en: 'Keep interior & selectively erase clutter or furniture', ko: '인테리어 유지 + 특정 잡동사니·가구 부분 삭제', ja: '内装を維持しながら不要な荷物を消去', es: 'Elimina objetos y desorden no deseado' },
      },
      paint: {
        title: { en: 'Wall & Floor', ko: '벽지 / 페인트 교체', ja: '壁紙・床材交換', es: 'Paredes y Suelos' },
        desc: { en: 'Preserve furniture + 1-Tap wallpaper color & flooring', ko: '가구 보존 + 벽지 색상 & 헤링본 바닥재 1-Tap 교체', ja: '家具保持＋壁紙カラーやヘリンボーン床を交換', es: 'Cambia colores de pared y textura de suelo' },
      },
    },
    tabs: {
      tools: { en: 'Tools', ko: '도구', ja: 'ツール', es: 'Herramientas' },
      create: { en: 'Create', ko: '제작', ja: '作成', es: 'Crear' },
      discover: { en: 'Discover', ko: '탐색', ja: '探索', es: 'Descubrir' },
      gallery: { en: 'History', ko: '보관함', ja: '履歴', es: 'Historial' },
      profile: { en: 'Profile', ko: '내 정보', ja: 'マイページ', es: 'Perfil' },
    },
  },
  wizard: {
    step1Title: { en: 'Add Room Photo', ko: '사진 추가하기', ja: '写真を追加', es: 'Añadir Foto' },
    step1Sub: {
      en: 'Upload your space photo or select a sample below',
      ko: '내 방 사진을 업로드하거나 아래 샘플을 선택하세요',
      ja: 'お部屋の写真をアップロードするかサンプルを選択してください',
      es: 'Sube una foto de tu espacio o selecciona una muestra',
    },
    uploadMain: { en: 'Upload My Space Photo', ko: '내 공간 사진 업로드하기', ja: '自分の空間写真をアップロード', es: 'Subir Foto de Mi Espacio' },
    uploadSub: { en: 'Tap to choose from photo library ➔', ko: '터치하여 휴대폰 사진첩 / 갤러리 선택 ➔', ja: 'タップして写真ライブラリから選択 ➔', es: 'Toca para elegir de la galería ➔' },
    uploadFormats: {
      en: 'Supports JPG, PNG, WebP (Drag & Drop)',
      ko: 'JPG, PNG, WebP 이미지 지원 (드래그 & 드롭 가능)',
      ja: 'JPG, PNG, WebP対応 (ドラッグ＆ドロップ可能)',
      es: 'Soporta JPG, PNG, WebP (Arrastrar y soltar)',
    },
    pickGallery: { en: 'Choose from Gallery', ko: '사진첩에서 선택', ja: 'アルバムから選択', es: 'Elegir de Galería' },
    takeCamera: { en: 'Take with Camera', ko: '카메라로 촬영', ja: 'カメラで撮影', es: 'Tomar con Cámara' },
    changePhoto: { en: '🔄 Change to another photo', ko: '🔄 다른 사진으로 변경하기', ja: '🔄 別の写真に変更する', es: '🔄 Cambiar a otra foto' },
    sampleTitle: { en: 'Sample Photos (3)', ko: '샘플 예시 사진 (3장)', ja: 'サンプル写真 (3枚)', es: 'Fotos de Muestra (3)' },
    sampleSub: { en: 'Click if you do not have a photo', ko: '사진이 없을 때 클릭해보세요', ja: '写真がない時にお試しください', es: 'Prueba si no tienes foto' },
    sampleSelected: { en: 'Selected ✓', ko: '선택됨 ✓', ja: '選択中 ✓', es: 'Seleccionado ✓' },
    agentTitle: { en: 'RoomFit AI Agent', ko: 'RoomFit AI 에이전트', ja: 'RoomFit AI エージェント', es: 'Agente RoomFit AI' },
    agentDesc: {
      en: 'Custom design direction (colors, furniture, mood)',
      ko: '원하는 인테리어 방향 (색상, 가구, 무드) 지시',
      ja: 'ご希望のデザイン方針（色、家具、ムード）を指示',
      es: 'Dirección personalizada (colores, muebles, ambiente)',
    },
    agentButton: { en: 'Direction ➔', ko: '방향 입력 ➔', ja: '指示入力 ➔', es: 'Dirección ➔' },
    agentEditButton: { en: 'Edit ✏️', ko: '수정 ✏️', ja: '修正 ✏️', es: 'Editar ✏️' },
    close: { en: '✕ Close', ko: '✕ 닫기', ja: '✕ 閉じる', es: '✕ Cerrar' },
    next: { en: 'Next Step ➔', ko: '다음 단계 ➔', ja: '次のステップ ➔', es: 'Siguiente Paso ➔' },
    back: { en: 'Back', ko: '이전', ja: '戻る', es: 'Atrás' },
    step2LayoutTitle: { en: '✨ AI Furniture & Item Detection', ko: '✨ AI 가구 & 소품 감지', ja: '✨ AI 家具＆アイテム検出', es: '✨ Detección AI de Muebles' },
    step2LayoutSub: {
      en: 'Detected furniture will be smartly reorganized in 3D',
      ko: '감지된 가구들의 동선과 배치가 3D로 스마트하게 재구성됩니다',
      ja: '検出された家具の動線と配置が3Dでスマートに再構成されます',
      es: 'Los muebles detectados se reorganizarán de forma inteligente en 3D',
    },
    step2RoomSelect: { en: 'Select Room Type', ko: '공간 유형 선택', ja: '部屋タイプを選択', es: 'Tipo de Espacio' },
    step3StyleTitle: { en: '🎨 Select Interior Style', ko: '🎨 인테리어 스타일 선택', ja: '🎨 スタイルを選択', es: '🎨 Seleccionar Estilo' },
    step3StyleSub: {
      en: 'Choose the theme that fits your taste',
      ko: '원하는 분위기와 디자인 컨셉을 선택하세요',
      ja: 'お好みの雰囲気とデザインコンセプトを選択してください',
      es: 'Elige el concepto y ambiente deseado',
    },
    step4RenderTitle: { en: '⚡ Render Options', ko: '⚡ 생성 옵션 설정', ja: '⚡ 生成オプション設定', es: '⚡ Opciones de Generación' },
    step4CountTitle: { en: 'Variations to Generate', ko: '생성할 결과 수', ja: '生成バリエーション数', es: 'Variaciones a Generar' },
    generateBtn: { en: 'Generate AI Design ➔', ko: 'AI 디자인 생성하기 ➔', ja: 'AIデザインを生成する ➔', es: 'Generar Diseño AI ➔' },
    generating: { en: 'Generating space...', ko: '공간을 변환하고 있습니다...', ja: '空間を変換しています...', es: 'Transformando el espacio...' },
  },
  agentModal: {
    title: { en: 'RoomFit AI Agent', ko: 'RoomFit AI 에이전트', ja: 'RoomFit AI エージェント', es: 'Agente RoomFit AI' },
    subtitle: {
      en: 'Tell us your custom design & furniture requirements',
      ko: '원하는 인테리어 방향 & 가구 변경사항을 입력하세요',
      ja: 'ご希望のインテリア方針や家具の変更点を入力してください',
      es: 'Dinos tus requisitos de diseño y cambios de muebles',
    },
    initialMessage: {
      en: 'Hello! I am RoomFit AI Lead Designer. Tell me your preferred vibe, items to add (plants, lights, pets, etc.), or specific requests!',
      ko: '안녕하세요! RoomFit AI 수석 디자이너 에이전트입니다. 원하시는 분위기, 배치할 소품(강아지, 화분, 조명 등)이나 특이사항을 말씀해 주세요!',
      ja: 'こんにちは！RoomFit AIチーフデザイナーです。ご希望の雰囲気や配置したいアイテム（観葉植物、照明、ペットなど）をお気軽にお知らせください！',
      es: '¡Hola! Soy el diseñador principal de RoomFit AI. Cuéntame el ambiente deseado o los elementos que quieras agregar.',
    },
    feedbackMessage: {
      en: 'Reflected "{text}" into the interior AI design engine!✨',
      ko: '"{text}" 요청을 인테리어 AI 프롬프트 엔진에 반영했습니다!✨',
      ja: '「{text}」のご要望をインテリアAIプロンプトに反映しました！✨',
      es: '¡Se ha aplicado "{text}" al motor de diseño interior AI!✨',
    },
    tagTitle: {
      en: '💡 Recommended Tags (Click to apply)',
      ko: '💡 추천 인테리어 요청 태그 (클릭시 즉시 적용)',
      ja: '💡 おすすめリクエストタグ（クリックで即適用）',
      es: '💡 Etiquetas Recomendadas (Clic para aplicar)',
    },
    placeholder: {
      en: 'e.g. Change living room sofa to natural wood and add warm lighting...',
      ko: '예: 거실 소파를 원목 우드로 바꾸고 조명 달아줘...',
      ja: '例：リビングのソファを木製にして温かい照明を追加して...',
      es: 'ej. Cambia el sofá a madera natural y añade iluminación cálida...',
    },
    send: { en: 'Send ➔', ko: '전송 ➔', ja: '送信 ➔', es: 'Enviar ➔' },
    apply: {
      en: '✨ Apply This Direction to Design',
      ko: '✨ 이 방향으로 인테리어 설정 적용하기',
      ja: '✨ この方針をインテリア設定に適用する',
      es: '✨ Aplicar esta dirección al diseño',
    },
    quickTags: [
      {
        en: '🛋️ Relocate sofa & add ambient lights',
        ko: '🛋️ 거실 소파 위치 변경 & 조명 추가',
        ja: '🛋️ ソファ位置変更＆間接照明追加',
        es: '🛋️ Mover sofá y añadir luz ambiental',
      },
      {
        en: '🪵 Warm natural wood & cozy mood',
        ko: '🪵 따뜻한 원목 감성 & 아늑한 분위기',
        ja: '🪵 温かい木目調＆心地よい雰囲気',
        es: '🪵 Madera natural cálida y acogedora',
      },
      {
        en: '🪴 Large potted plant & rattan rug',
        ko: '🪴 대형 화분 식물 배치 & 라탄 카펫',
        ja: '🪴 大型観葉植物＆ラタンラグ配置',
        es: '🪴 Planta en maceta grande y alfombra de ratán',
      },
      {
        en: '💡 Soft indirect mood lighting',
        ko: '💡 간접 조명 & 은은한 무드등',
        ja: '💡 間接照明＆ほのかなムードライト',
        es: '💡 Iluminación indirecta tenue',
      },
      {
        en: '🧹 Clean minimal storage & declutter',
        ko: '🧹 짐정리 & 깔끔한 미니멀 수납',
        ja: '🧹 荷物片付け＆すっきりミニマル収納',
        es: '🧹 Almacenamiento minimalista y orden',
      },
    ],
  },
  profile: {
    title: { en: 'My Profile', ko: '내 프로필', ja: 'マイプロフィール', es: 'Mi Perfil' },
    creditsAvailable: { en: 'Available Credits', ko: '보유 크레딧', ja: '保有クレジット', es: 'Créditos Disponibles' },
    unlimitedBadge: { en: 'Unlimited Pass Active', ko: '무제한 이용권 활성화됨', ja: '無制限パス有効', es: 'Pase Ilimitado Activo' },
    creditsText: { en: '{count} Credits', ko: '{count} 크레딧', ja: '{count} クレジット', es: '{count} Créditos' },
    rechargeBtn: { en: '💎 Upgrade Plan / Recharge', ko: '💎 멤버십 충전 / 업그레이드', ja: '💎 プランアップグレード / チャージ', es: '💎 Mejorar Plan / Recargar' },
    langSetting: { en: '🌐 App Language', ko: '🌐 앱 언어 설정', ja: '🌐 アプリ言語設定', es: '🌐 Idioma de la App' },
    historyTitle: { en: '🖼️ Generation History', ko: '🖼️ 최근 생성 보관함', ja: '🖼️ 生成履歴・保存庫', es: '🖼️ Historial de Diseños' },
    emptyHistory: {
      en: 'No generated designs yet. Try your first design!',
      ko: '아직 저장된 디자인이 없습니다. 첫 변환을 시작해보세요!',
      ja: 'まだ保存されたデザインがありません。最初のデザインを試してみましょう！',
      es: 'Aún no hay diseños guardados. ¡Prueba tu primer diseño!',
    },
  },
  result: {
    completedTitle: { en: 'AI Design Completed!', ko: 'AI 디자인 완성!', ja: 'AIデザイン完成！', es: '¡Diseño AI Completado!' },
    sliderCompare: { en: 'Before/After Slider', ko: '비포/애프터 비교', ja: '前後比較スライダー', es: 'Deslizador Antes/Después' },
    save: { en: 'Save', ko: '보관함 저장', ja: '保存', es: 'Guardar' },
    download: { en: 'Download 4K', ko: '4K 다운로드', ja: '4Kダウンロード', es: 'Descargar 4K' },
    share: { en: 'Share', ko: '공유하기', ja: '共有', es: 'Compartir' },
    redo: { en: 'Redo', ko: '다시 생성', ja: '再生成', es: 'Regenerar' },
  },
};

export function getTranslation(lang: Language, section: keyof typeof translations, key: string, fallback: string = ''): string {
  try {
    const sec = translations[section] as any;
    if (sec && sec[key]) {
      return sec[key][lang] || sec[key]['en'] || fallback;
    }
  } catch (e) {}
  return fallback;
}
