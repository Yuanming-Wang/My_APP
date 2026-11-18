import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, FlatList, Image, ScrollView, Modal, Animated,
  Dimensions, Linking, ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE = 'http://47.99.121.214:3001/api';

// ==================== 类型 ====================
interface MediaItem { id: string; uri: string; type: 'image' | 'video'; story: string; }
interface Book { id: string; title: string; ownerName: string; coverUrl: string; pages: MediaItem[]; createdAt: string; archiveNo: string; }
interface ChildContact { id: string; name: string; phone: string; }

// ==================== 全局状态 ====================
let globalBooks: Book[] = [];
let globalAvatar: string | null = null;
let globalChildren: ChildContact[] = [];
let globalPhone = '';

// ==================== 工具 ====================
const genId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
const greeting = () => { const h = new Date().getHours(); return h < 9 ? '早上好' : h < 12 ? '上午好' : h < 14 ? '中午好' : h < 17 ? '下午好' : '晚上好'; };
const today = () => { const d = new Date(); return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; };
const archiveNo = (i: number) => { const d = new Date(); return `OT-${d.getFullYear()}-${String(i+1).padStart(3,'0')}`; };

// ==================== 颜色常量 ====================
const C = {
  primary: '#8B4513', primaryLight: '#A0522D', primaryDark: '#6C2F00',
  gold: '#D4AF37', goldLight: '#E8C547',
  bgPage: '#F8F5EE', bgCard: '#FFFFFF', bgParchment: '#F5F0E6',
  text: '#2D2318', text2: '#5A4D3F', text3: '#A89887',
  border: '#E5DCD1', borderGold: 'rgba(212,175,55,0.3)',
  success: '#52C41A', error: '#FF4D4F',
};

// ==================== 登录页 ====================
function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [cd, setCd] = useState(0);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (phone.length !== 11) { Alert.alert('提示','请输入11位手机号'); return; }
    // 本地模拟验证码（生产环境对接短信服务商API）
    setSent(true); setCd(60); globalPhone = phone;
    Alert.alert('验证码已发送','验证码已发送到您的手机\n\n演示验证码：123456');
    const t = setInterval(() => setCd(p => { if(p<=1){clearInterval(t);return 0;} return p-1; }),1000);
  };

  const login = async () => {
    if(loading)return; if(code.length!==6){Alert.alert('提示','请输入6位验证码');return;}
    if(code !== '123456'){Alert.alert('错误','验证码错误，请输入123456');return;}
    setLoading(true);
    await new Promise(r=>setTimeout(r,800));
    setLoading(false);
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={st.c}>
      <View style={st.lc}>
        {/* 沙漏图标 */}
        <View style={st.logoBox}>
          <View style={st.logo}>
            <View style={st.hourglass}>
              <View style={st.hTop}/>
              <View style={st.hMid}/>
              <View style={st.hBot}/>
            </View>
          </View>
        </View>
        <Text style={st.appTitle}>OldTime</Text>
        <Text style={st.appSub}>旧时光 · 新珍藏</Text>

        <View style={st.form}>
          <Text style={st.label}>手机号</Text>
          <View style={st.phoneRow}>
            <Text style={st.countryCode}>+86</Text>
            <View style={st.divider}/>
            <TextInput style={st.phoneInput} value={phone} onChangeText={setPhone}
              placeholder="请输入手机号" placeholderTextColor={C.text3} keyboardType="phone-pad" maxLength={11}/>
          </View>

          {sent && <View style={{marginTop:20}}>
            <Text style={st.label}>验证码</Text>
            <TextInput style={st.codeInput} value={code} onChangeText={setCode}
              placeholder="请输入6位验证码" placeholderTextColor={C.text3} keyboardType="number-pad" maxLength={6}/>
            <TouchableOpacity onPress={sendCode} disabled={cd>0}>
              <Text style={st.resend}>{cd>0?`${cd}秒后重发`:'重新发送'}</Text>
            </TouchableOpacity>
          </View>}

          <TouchableOpacity style={[st.btn, {opacity: sent ? (code.length===6?1:0.4) : (phone.length===11?1:0.4)}]}
            onPress={sent ? login : sendCode} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#FFF"/> : <Text style={st.btnT}>{sent ? '登录' : '发送验证码'}</Text>}
          </TouchableOpacity>
        </View>

        <Text style={st.footer}>登录即表示同意《用户协议》和《隐私政策》</Text>
      </View>
    </SafeAreaView>
  );
}

// ==================== 入藏动画 ====================
function GeneratingScreen({ navigation, route }: any) {
  const { media: ms, ownerName } = route.params;
  const [phase, setPhase] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const phases = [
    { label: '正在收集照片...', icon: '📷' },
    { label: '正在润色故事...', icon: '✍️' },
    { label: '正在生成封面...', icon: '🎨' },
    { label: '入藏完成！', icon: '✨' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => setPhase(3), 2400);
    const t4 = setTimeout(() => {
      const mediaList: MediaItem[] = JSON.parse(ms);
      const book: Book = {
        id: genId(), title: `${ownerName||'我'}的回忆`, ownerName: ownerName||'我',
        coverUrl: mediaList[0]?.uri||'', pages: mediaList, createdAt: today(),
        archiveNo: archiveNo(globalBooks.length),
      };
      globalBooks = [book, ...globalBooks];
      navigation.replace('Reader', { bookId: book.id });
    }, 3200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: (phase+1)/4, duration: 600, useNativeDriver: false }).start();
  }, [phase]);

  return (
    <SafeAreaView style={[st.c, { backgroundColor: '#1A0E08' }]}>
      <View style={st.genCenter}>
        <Animated.View style={[st.genBook, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={st.genCover}>
            <View style={st.genSpine}/>
            <Text style={st.genTitle}>旧时光</Text>
            <Text style={st.genSub}>数字纪念册</Text>
          </View>
        </Animated.View>

        <View style={st.phases}>
          {phases.map((p, i) => (
            <Animated.View key={i} style={[st.phaseRow, { opacity: phase >= i ? 1 : 0.3 }]}>
              <Text style={{fontSize:20,marginRight:12}}>{p.icon}</Text>
              <Text style={[st.phaseText, phase === i && {color:'#FFF'}]}>{p.label}</Text>
              {phase > i && <Text style={{color:C.gold,marginLeft:8}}>✓</Text>}
            </Animated.View>
          ))}
        </View>

        <View style={st.progressBar}>
          <Animated.View style={[st.progressFill, { width: progressAnim.interpolate({inputRange:[0,1],outputRange:['0%','100%']}) }]}/>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ==================== 首页 ====================
function HomeScreen({ navigation }: any) {
  const [books, setBooks] = useState(globalBooks);
  useEffect(() => { const t = setInterval(() => setBooks([...globalBooks]), 500); return () => clearInterval(t); }, []);

  return (
    <SafeAreaView style={st.c} edges={['top']}>
      <View style={st.header}>
        <View style={st.headerLeft}>
          <View style={st.headerLogo}>
            <View style={st.hSmall}/>
          </View>
          <Text style={st.headerT}>OldTime</Text>
        </View>
        <TouchableOpacity onPress={()=>navigation.navigate('Profile')} style={st.avatarBtn} activeOpacity={0.7}>
          <View style={st.avatar}>
            {globalAvatar ? <Image source={{uri:globalAvatar}} style={st.avatarImg}/> : <Text style={st.avatarT}>我</Text>}
          </View>
        </TouchableOpacity>
      </View>

      <FlatList data={books} keyExtractor={i=>i.id} contentContainerStyle={{padding:16,paddingBottom:100}}
        ListHeaderComponent={<>
          <Text style={st.greeting}>{greeting()}，今天有藏品要入馆吗？</Text>
          <TouchableOpacity style={st.createCard} onPress={()=>navigation.navigate('Create')} activeOpacity={0.85}>
            <View style={st.createIcon}><Text style={{fontSize:28}}>📷</Text></View>
            <View style={{flex:1}}>
              <Text style={st.createTitle}>开始制作回忆</Text>
              <Text style={st.createDesc}>挑选照片，讲述故事，入藏成册</Text>
            </View>
            <Text style={st.arrow}>›</Text>
          </TouchableOpacity>
          <Text style={st.sectionTitle}>我的收藏馆</Text>
        </>}
        renderItem={({item})=>(
          <TouchableOpacity style={st.bookCard} onPress={()=>navigation.navigate('Reader',{bookId:item.id})} activeOpacity={0.85}>
            <Image source={{uri:item.coverUrl}} style={st.bookCover}/>
            <View style={st.bookInfo}>
              <Text style={st.bookArchiveNo}>{item.archiveNo}</Text>
              <Text style={st.bookTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={st.bookMeta}>{item.pages.length}页 · {item.ownerName}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={st.emptyBox}>
            <View style={st.emptyIconBox}><Text style={{fontSize:48}}>🏛️</Text></View>
            <Text style={st.emptyTitle}>你的收藏馆空空如也</Text>
            <Text style={st.emptyDesc}>点击上方按钮，制作你的第一本纪念册</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ==================== 制作页 ====================
function CreateScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);

  const pick = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(status!=='granted'){Alert.alert('提示','需要相册权限才能选择照片');return;}
    const r = await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,allowsMultipleSelection:true,selectionLimit:200-media.length,quality:0.8});
    if(!r.canceled&&r.assets) setMedia([...media,...r.assets.map(a=>({id:genId(),uri:a.uri,type:'image' as const,story:''}))]);
  };

  return (
    <SafeAreaView style={st.c} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={st.backBtn}><Text style={st.backT}>←</Text></TouchableOpacity>
        <Text style={st.headerT}>挑选藏品</Text><View style={{width:40}}/>
      </View>
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:16}}>
        <Text style={st.label}>珍藏人</Text>
        <TextInput style={st.input} value={name} onChangeText={setName} placeholder="例如：张爷爷" placeholderTextColor={C.text3} maxLength={20}/>
        <TouchableOpacity style={st.uploadCard} onPress={pick} activeOpacity={0.85}>
          <View style={st.uploadIcon}><Text style={{fontSize:32,color:C.primary}}>+</Text></View>
          <Text style={st.uploadTitle}>从手机里挑选照片</Text>
          <Text style={st.uploadDesc}>最多200张 · 支持JPG/PNG</Text>
        </TouchableOpacity>
        {media.length>0 && <>
          <Text style={st.sectionTitle}>已选 {media.length} 张藏品</Text>
          <View style={st.photoGrid}>{media.map((m,i)=>(
            <View key={m.id} style={st.photoItem}>
              <Image source={{uri:m.uri}} style={st.photoImg}/>
              <View style={st.photoIdx}><Text style={st.photoIdxT}>{i+1}</Text></View>
              <TouchableOpacity style={st.photoDel} onPress={()=>setMedia(media.filter(x=>x.id!==m.id))}><Text style={{color:'#FFF',fontSize:16,fontWeight:'600'}}>×</Text></TouchableOpacity>
            </View>
          ))}</View>
        </>}
      </ScrollView>
      {media.length>0 && <View style={st.footer}>
        <Text style={st.footerText}>已选 <Text style={{color:C.primary,fontWeight:'600'}}>{media.length}</Text> 个文件</Text>
        <TouchableOpacity style={st.btn} onPress={()=>navigation.navigate('Stories',{media:JSON.stringify(media),ownerName:name})}><Text style={st.btnT}>下一步，讲故事</Text></TouchableOpacity>
      </View>}
    </SafeAreaView>
  );
}

// ==================== 讲故事 ====================
function StoriesScreen({ navigation, route }: any) {
  const {media:ms,ownerName} = route.params;
  const [list,setList] = useState<MediaItem[]>(JSON.parse(ms));
  const [idx,setIdx] = useState(0);
  const cur = list[idx];
  const upd = (st:string) => { const n=[...list]; n[idx]={...n[idx],story:st}; setList(n); };

  return (
    <SafeAreaView style={st.c} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={st.backBtn}><Text style={st.backT}>←</Text></TouchableOpacity>
        <Text style={st.headerT}>讲述故事</Text><View style={{width:40}}/>
      </View>
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:16}}>
        <Image source={{uri:cur.uri}} style={st.storyImg}/>
        <Text style={st.storyIndex}>第 {idx+1} / {list.length} 张</Text>
        <Text style={st.label}>为这张照片写一句话：</Text>
        <TextInput style={[st.input,{height:120,textAlignVertical:'top'}]} value={cur.story} onChangeText={upd}
          placeholder="例如：这是我和老战友在公园重逢，那天聊了很多年轻时候的事。" placeholderTextColor={C.text3} multiline maxLength={500}/>
        <Text style={st.charCount}>{cur.story.length}/500</Text>
      </ScrollView>
      <View style={st.footer}>
        <TouchableOpacity style={[st.btn,{flex:1,marginRight:8,backgroundColor:C.bgCard,borderWidth:1,borderColor:C.border}]}
          onPress={()=>idx>0&&setIdx(idx-1)}><Text style={[st.btnT,{color:C.text}]}>上一张</Text></TouchableOpacity>
        {idx<list.length-1 ? (
          <TouchableOpacity style={[st.btn,{flex:1}]} onPress={()=>setIdx(idx+1)}><Text style={st.btnT}>下一张</Text></TouchableOpacity>
        ) : (
          <TouchableOpacity style={[st.btn,{flex:1}]} onPress={()=>navigation.replace('Generating',{media:JSON.stringify(list),ownerName})}><Text style={st.btnT}>入藏</Text></TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==================== 阅读器 ====================
function ReaderScreen({ navigation, route }: any) {
  const {bookId} = route.params;
  const book = globalBooks.find(b=>b.id===bookId);
  const [pi,setPi] = useState(0);
  if(!book) return <SafeAreaView style={st.c}><View style={st.emptyBox}><Text style={st.emptyTitle}>未找到纪念册</Text></View></SafeAreaView>;
  const pg = book.pages[pi];
  const isCover = pi === 0;
  const isCert = pi === book.pages.length + 1;
  const totalPages = book.pages.length + 2;

  return (
    <SafeAreaView style={st.c} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={st.backBtn}><Text style={st.backT}>←</Text></TouchableOpacity>
        <Text style={st.headerT}>{book.title}</Text>
        <TouchableOpacity onPress={()=>navigation.navigate('Share',{bookId})}><Text style={{fontSize:20}}>📤</Text></TouchableOpacity>
      </View>
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:16}}>
        {isCover ? (
          <View style={st.coverPage}>
            <Image source={{uri:book.coverUrl}} style={st.coverImg}/>
            <View style={st.coverOverlay}/>
            <View style={st.coverInfo}>
              <Text style={st.coverArchiveNo}>{book.archiveNo}</Text>
              <Text style={st.coverTitle}>{book.title}</Text>
              <Text style={st.coverSub}>{book.ownerName} · {book.createdAt}</Text>
            </View>
          </View>
        ) : isCert ? (
          <View style={st.certPage}>
            <Text style={{fontSize:48,marginBottom:16}}>🏅</Text>
            <Text style={st.certLabel}>收藏证书</Text>
            <Text style={st.certTitle}>{book.title}</Text>
            <Text style={st.certDesc}>这本纪念册记录了{book.ownerName}的一段珍贵旧时光。愿每一次翻阅，都能想起那天的温暖。</Text>
            <View style={st.certDivider}/>
            <Text style={st.certOwner}>{book.ownerName} 珍藏</Text>
            <Text style={st.certMeta}>{book.archiveNo} · {book.createdAt}</Text>
          </View>
        ) : (
          <View style={st.readerPage}>
            <Image source={{uri:pg.uri}} style={st.readerImg}/>
            <View style={st.readerStory}>
              <Text style={st.readerStoryT}>{pg.story || '这里还没有故事...'}</Text>
            </View>
          </View>
        )}
        <View style={st.pageDots}>
          {Array.from({length:totalPages}).map((_,i)=>(
            <TouchableOpacity key={i} onPress={()=>setPi(i)} style={[st.dot,i===pi&&st.dotActive]}/>
          ))}
        </View>
        <Text style={st.pageNum}>{pi+1} / {totalPages}</Text>
      </ScrollView>
      <View style={st.footer}>
        <TouchableOpacity style={[st.btn,{flex:1,marginRight:8,backgroundColor:C.bgCard,borderWidth:1,borderColor:C.border}]}
          onPress={()=>pi>0&&setPi(pi-1)}><Text style={[st.btnT,{color:C.text}]}>上一页</Text></TouchableOpacity>
        {pi<totalPages-1 ? (
          <TouchableOpacity style={[st.btn,{flex:1}]} onPress={()=>setPi(pi+1)}><Text style={st.btnT}>下一页</Text></TouchableOpacity>
        ) : (
          <TouchableOpacity style={[st.btn,{flex:1}]} onPress={()=>navigation.navigate('Share',{bookId})}><Text style={st.btnT}>送出去</Text></TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==================== 分享 ====================
function ShareScreen({ navigation, route }: any) {
  const {bookId} = route.params;
  const book = globalBooks.find(b=>b.id===bookId);
  const [copied,setCopied] = useState(false);
  if(!book) return null;

  const copyLink = () => {
    setCopied(true);
    Alert.alert('已复制','分享链接已复制到剪贴板，可以发给家人和老朋友。');
    setTimeout(()=>setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={st.c} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={st.backBtn}><Text style={st.backT}>←</Text></TouchableOpacity>
        <Text style={st.headerT}>送出去</Text><View style={{width:40}}/>
      </View>
      <View style={{padding:16,flex:1}}>
        <View style={st.shareCard}>
          <Image source={{uri:book.coverUrl}} style={st.shareCover}/>
          <View style={{flex:1,marginLeft:16}}>
            <Text style={st.bookArchiveNo}>{book.archiveNo}</Text>
            <Text style={st.bookTitle}>{book.title}</Text>
            <Text style={st.bookMeta}>{book.pages.length}页 · {book.ownerName}</Text>
          </View>
        </View>
        <Text style={[st.emptyTitle,{textAlign:'center',marginTop:32}]}>送给谁珍藏？</Text>
        <Text style={[st.emptyDesc,{textAlign:'center',marginBottom:32}]}>复制链接后，可以发到微信、短信或家庭群。</Text>
        <TouchableOpacity style={[st.btn,copied&&{backgroundColor:C.success}]} onPress={copyLink} activeOpacity={0.85}>
          <Text style={st.btnT}>{copied ? '已复制 ✓' : '复制分享链接'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[st.btn,{marginTop:12,backgroundColor:C.bgCard,borderWidth:1,borderColor:C.border}]}
          onPress={()=>navigation.navigate('Home')}><Text style={[st.btnT,{color:C.text}]}>回到收藏馆</Text></TouchableOpacity>
        <View style={st.tipBox}>
          <Text style={{fontSize:16,marginRight:8}}>💡</Text>
          <Text style={st.tipText}>收到链接的人，可以在手机上直接打开查看这本纪念册。</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ==================== 收藏馆 ====================
function CollectionScreen({ navigation }: any) {
  const [books, setBooks] = useState(globalBooks);
  useEffect(() => { const t = setInterval(() => setBooks([...globalBooks]), 500); return () => clearInterval(t); }, []);

  return (
    <SafeAreaView style={st.c} edges={['top']}>
      <View style={st.header}><Text style={st.headerT}>收藏馆</Text></View>
      <FlatList data={books} keyExtractor={i=>i.id} contentContainerStyle={{padding:16,paddingBottom:100}} numColumns={2} columnWrapperStyle={{gap:12}}
        renderItem={({item})=>(
          <TouchableOpacity style={st.collCard} onPress={()=>navigation.navigate('Reader',{bookId:item.id})} activeOpacity={0.85}>
            <Image source={{uri:item.coverUrl}} style={st.collCover}/>
            <View style={st.collInfo}>
              <Text style={st.bookArchiveNo}>{item.archiveNo}</Text>
              <Text style={st.bookTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={st.bookMeta}>{item.pages.length}页</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={st.emptyBox}>
            <View style={st.emptyIconBox}><Text style={{fontSize:48}}>📚</Text></View>
            <Text style={st.emptyTitle}>还没有藏品</Text>
            <Text style={st.emptyDesc}>制作完成后会显示在这里</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ==================== 求助 ====================
function HelpScreen() {
  const [sending, setSending] = useState(false);
  const [children, setChildren] = useState<ChildContact[]>(globalChildren);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [helpMsg, setHelpMsg] = useState('我需要帮助制作回忆纪念册，请帮帮我！');

  const addChild = () => {
    if(!cName.trim()||!cPhone.trim()){Alert.alert('提示','请填写完整');return;}
    const c:ChildContact={id:genId(),name:cName.trim(),phone:cPhone.trim()};
    globalChildren=[...globalChildren,c]; setChildren([...globalChildren]);
    setCName(''); setCPhone(''); setShowAdd(false);
    Alert.alert('已添加',`${c.name}的联系方式已保存`);
  };

  const removeChild = (id:string) => {
    Alert.alert('确认','确定删除这个联系方式？',[
      {text:'取消',style:'cancel'},
      {text:'删除',style:'destructive',onPress:()=>{globalChildren=globalChildren.filter(c=>c.id!==id);setChildren([...globalChildren]);}}
    ]);
  };

  const sendHelp = async () => {
    if(sending) return;
    setSending(true);
    await new Promise(r=>setTimeout(r,1000));
    setSending(false);
    Alert.alert('已发送','求助信号已发送，孩子会收到通知。');
  };

  const shareLink = () => {
    Alert.alert('已复制','求助链接已复制到剪贴板');
  };

  return (
    <SafeAreaView style={st.c} edges={['top']}>
      <View style={st.header}><Text style={st.headerT}>向孩子求助</Text></View>
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:16,paddingBottom:100}}>
        {/* 说明 */}
        <View style={st.helpInfo}>
          <View style={st.helpIconBox}><Text style={{fontSize:40}}>👨‍👩‍👧</Text></View>
          <Text style={st.emptyTitle}>让孩子帮你讲故事</Text>
          <Text style={[st.emptyDesc,{textAlign:'center',lineHeight:22}]}>你可以把照片选好，让孩子帮你写故事。{'\n'}或者直接让孩子帮你挑选照片。</Text>
        </View>

        {/* 孩子联系方式 */}
        <View style={st.sectionHeader}>
          <Text style={st.sectionTitle}>孩子联系方式</Text>
          <TouchableOpacity onPress={()=>setShowAdd(true)}><Text style={st.addBtn}>+ 添加</Text></TouchableOpacity>
        </View>
        {children.length>0 ? children.map(c=>(
          <View key={c.id} style={st.childCard}>
            <View style={st.childAvatar}><Text style={st.childAvatarT}>{c.name[0]}</Text></View>
            <View style={{flex:1}}>
              <Text style={st.childName}>{c.name}</Text>
              <Text style={st.childPhone}>{c.phone}</Text>
            </View>
            <TouchableOpacity onPress={()=>Linking.openURL(`tel:${c.phone}`)} style={st.childBtn}><Text style={{fontSize:18}}>📞</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>Linking.openURL(`sms:${c.phone}&body=${encodeURIComponent(helpMsg)}`)} style={st.childBtn}><Text style={{fontSize:18}}>💬</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>removeChild(c.id)} style={st.childBtn}><Text style={{fontSize:18,color:C.error}}>×</Text></TouchableOpacity>
          </View>
        )) : (
          <View style={st.emptyBox}>
            <View style={st.emptyIconBox}><Text style={{fontSize:32}}>📱</Text></View>
            <Text style={st.emptyTitle}>还没有添加孩子联系方式</Text>
            <Text style={st.emptyDesc}>点击上方"添加"按钮</Text>
          </View>
        )}

        {/* 求助方式 */}
        <Text style={[st.sectionTitle,{marginTop:24,marginBottom:12}]}>求助方式</Text>
        <TouchableOpacity style={st.menuItem} onPress={()=>setShowEdit(true)} activeOpacity={0.85}>
          <Text style={{fontSize:24,marginRight:16}}>✏️</Text>
          <View style={{flex:1}}>
            <Text style={st.menuTitle}>编辑求助信息</Text>
            <Text style={st.menuDesc} numberOfLines={1}>{helpMsg}</Text>
          </View>
          <Text style={st.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[st.menuItem,sending&&{opacity:0.4}]} onPress={sendHelp} disabled={sending} activeOpacity={0.85}>
          <Text style={{fontSize:24,marginRight:16}}>🔔</Text>
          <View style={{flex:1}}>
            <Text style={st.menuTitle}>{sending?'发送中...':'发送求助信号'}</Text>
            <Text style={st.menuDesc}>通知孩子来帮你操作</Text>
          </View>
          <Text style={st.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.menuItem} onPress={shareLink} activeOpacity={0.85}>
          <Text style={{fontSize:24,marginRight:16}}>🔗</Text>
          <View style={{flex:1}}>
            <Text style={st.menuTitle}>分享求助链接</Text>
            <Text style={st.menuDesc}>通过微信发送给孩子</Text>
          </View>
          <Text style={st.arrow}>›</Text>
        </TouchableOpacity>

        <View style={st.tipBox}>
          <Text style={{fontSize:16,marginRight:8}}>💡</Text>
          <Text style={st.tipText}>孩子收到链接后，可以在手机上直接帮你编辑故事。</Text>
        </View>
      </ScrollView>

      {/* 添加孩子弹窗 */}
      <Modal visible={showAdd} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <Text style={[st.headerT,{marginBottom:20,textAlign:'center'}]}>添加孩子联系方式</Text>
            <Text style={st.label}>姓名</Text>
            <TextInput style={st.input} value={cName} onChangeText={setCName} placeholder="例如：小明" placeholderTextColor={C.text3}/>
            <Text style={[st.label,{marginTop:16}]}>手机号</Text>
            <TextInput style={st.input} value={cPhone} onChangeText={setCPhone} placeholder="请输入手机号" placeholderTextColor={C.text3} keyboardType="phone-pad" maxLength={11}/>
            <View style={{flexDirection:'row',marginTop:24,gap:12}}>
              <TouchableOpacity style={[st.btn,{flex:1,backgroundColor:C.bgCard,borderWidth:1,borderColor:C.border}]} onPress={()=>setShowAdd(false)}><Text style={[st.btnT,{color:C.text}]}>取消</Text></TouchableOpacity>
              <TouchableOpacity style={[st.btn,{flex:1}]} onPress={addChild}><Text style={st.btnT}>添加</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 编辑求助信息弹窗 */}
      <Modal visible={showEdit} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <Text style={[st.headerT,{marginBottom:20,textAlign:'center'}]}>编辑求助信息</Text>
            <TextInput style={[st.input,{height:120,textAlignVertical:'top'}]} value={helpMsg} onChangeText={setHelpMsg}
              placeholder="请输入求助信息" placeholderTextColor={C.text3} multiline maxLength={200}/>
            <Text style={{fontSize:12,color:C.text3,textAlign:'right',marginTop:8}}>{helpMsg.length}/200</Text>
            <View style={{flexDirection:'row',marginTop:24,gap:12}}>
              <TouchableOpacity style={[st.btn,{flex:1,backgroundColor:C.bgCard,borderWidth:1,borderColor:C.border}]} onPress={()=>setShowEdit(false)}><Text style={[st.btnT,{color:C.text}]}>取消</Text></TouchableOpacity>
              <TouchableOpacity style={[st.btn,{flex:1}]} onPress={()=>setShowEdit(false)}><Text style={st.btnT}>保存</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==================== 个人主页 ====================
function ProfileScreen({ navigation }: any) {
  const [avatar, setAvatar] = useState<string|null>(globalAvatar);
  const pickAvatar = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(status!=='granted'){Alert.alert('提示','需要相册权限');return;}
    const r = await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,allowsEditing:true,aspect:[1,1],quality:0.8});
    if(!r.canceled&&r.assets[0]){setAvatar(r.assets[0].uri);globalAvatar=r.assets[0].uri;}
  };

  return (
    <SafeAreaView style={st.c} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={st.backBtn}><Text style={st.backT}>←</Text></TouchableOpacity>
        <Text style={st.headerT}>我的</Text><View style={{width:40}}/>
      </View>
      <ScrollView style={{flex:1}} contentContainerStyle={{padding:16}}>
        <TouchableOpacity style={st.profileCard} onPress={pickAvatar} activeOpacity={0.85}>
          {avatar?<Image source={{uri:avatar}} style={st.profileAvatar}/>:<View style={[st.profileAvatar,{backgroundColor:C.primary,justifyContent:'center',alignItems:'center'}]}><Text style={{color:'#FFF',fontSize:28,fontWeight:'bold'}}>我</Text></View>}
          <View style={{flex:1,marginLeft:16}}>
            <Text style={st.menuTitle}>点击设置头像</Text>
            <Text style={st.menuDesc}>让回忆更有温度</Text>
          </View>
          <Text style={st.arrow}>›</Text>
        </TouchableOpacity>
        <View style={{marginTop:16}}>
          {[
            {icon:'📖',label:'我的藏品',desc:'查看所有纪念册',onPress:()=>navigation.navigate('CollectionTab')},
            {icon:'👨‍👩‍👧',label:'向孩子求助',desc:'让孩子帮你写故事',onPress:()=>navigation.navigate('HelpTab')},
            {icon:'💬',label:'帮助与反馈',desc:'常见问题与建议',onPress:()=>Alert.alert('帮助与反馈','如有问题请联系：support@oldtime.app')},
            {icon:'ℹ️',label:'关于',desc:'回忆 v1.0.0',onPress:()=>Alert.alert('关于','回忆 OldTime v1.0.0\n旧时光 · 新珍藏\n\n让每一位老人都能拥有一本值得珍藏的数字纪念册')},
          ].map((it,i)=>(
            <TouchableOpacity key={i} style={st.menuItem} onPress={it.onPress} activeOpacity={0.7}>
              <Text style={{fontSize:22,marginRight:16}}>{it.icon}</Text>
              <View style={{flex:1}}><Text style={st.menuTitle}>{it.label}</Text><Text style={st.menuDesc}>{it.desc}</Text></View>
              <Text style={st.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[st.btn,{marginTop:32,backgroundColor:C.error}]} onPress={()=>navigation.replace('Login')}><Text style={st.btnT}>退出登录</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== 导航 ====================
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: C.bgCard, borderTopColor: C.border, paddingBottom: 20, height: 80 },
      tabBarActiveTintColor: C.primary,
      tabBarInactiveTintColor: C.text3,
      tabBarLabelStyle: { fontSize: 12, fontFamily: 'serif' },
    }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{tabBarLabel:'回忆',tabBarIcon:({focused})=><TabIcon emoji="🏛️" focused={focused}/>}}/>
      <Tab.Screen name="CollectionTab" component={CollectionScreen} options={{tabBarLabel:'收藏馆',tabBarIcon:({focused})=><TabIcon emoji="📚" focused={focused}/>}}/>
      <Tab.Screen name="HelpTab" component={HelpScreen} options={{tabBarLabel:'求助',tabBarIcon:({focused})=><TabIcon emoji="👨‍👩‍👧" focused={focused}/>}}/>
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{headerShown:false}}>
          <Stack.Screen name="Login" component={LoginScreen}/>
          <Stack.Screen name="Main" component={MainTabs}/>
          <Stack.Screen name="Create" component={CreateScreen}/>
          <Stack.Screen name="Stories" component={StoriesScreen}/>
          <Stack.Screen name="Generating" component={GeneratingScreen}/>
          <Stack.Screen name="Reader" component={ReaderScreen}/>
          <Stack.Screen name="Share" component={ShareScreen}/>
          <Stack.Screen name="Profile" component={ProfileScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto"/>
    </SafeAreaProvider>
  );
}

// ==================== 样式 - Apple Design Award 级别 ====================
const st = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.bgPage },
  lc: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },

  // Logo
  logoBox: { marginBottom: 24 },
  logo: { width: 80, height: 80, borderRadius: 20, backgroundColor: C.primaryDark, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.borderGold },
  hourglass: { width: 36, height: 48, justifyContent: 'center', alignItems: 'center' },
  hTop: { width: 30, height: 18, borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderColor: C.gold, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  hMid: { width: 12, height: 2, backgroundColor: C.gold, marginVertical: 2 },
  hBot: { width: 30, height: 18, borderBottomWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderColor: C.gold, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  appTitle: { fontSize: 28, fontWeight: '700', color: C.text, fontFamily: 'serif', letterSpacing: 4 },
  appSub: { fontSize: 14, color: C.text3, marginTop: 4, fontFamily: 'serif' },

  // 表单
  form: { width: '100%', marginTop: 48 },
  label: { fontSize: 13, color: C.text2, marginBottom: 8, fontFamily: 'serif' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 16, height: 56 },
  countryCode: { fontSize: 16, color: C.text, fontFamily: 'serif', fontWeight: '500' },
  divider: { width: 1, height: 24, backgroundColor: C.border, marginHorizontal: 16 },
  phoneInput: { flex: 1, fontSize: 16, color: C.text, fontFamily: 'serif', height: 56 },
  codeInput: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 16, height: 56, fontSize: 20, color: C.text, fontFamily: 'serif', letterSpacing: 12, textAlign: 'center' },
  resend: { fontSize: 13, color: C.primary, textAlign: 'right', marginTop: 8, fontFamily: 'serif' },
  btn: { backgroundColor: C.primary, borderRadius: 16, height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 20, borderWidth: 0.5, borderColor: C.borderGold },
  btnT: { fontSize: 16, fontWeight: '600', color: '#FFF', fontFamily: 'serif' },
  footer: { fontSize: 11, color: C.text3, textAlign: 'center', position: 'absolute', bottom: 40, fontFamily: 'serif' },

  // 头部
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerLogo: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.primaryDark, justifyContent: 'center', alignItems: 'center' },
  hSmall: { width: 14, height: 18, borderWidth: 1.5, borderColor: C.gold, borderRadius: 2 },
  headerT: { fontSize: 18, fontWeight: '600', color: C.text, fontFamily: 'serif' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backT: { fontSize: 24, color: C.text },
  avatarBtn: { padding: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  avatarT: { color: '#FFF', fontSize: 14, fontWeight: '600', fontFamily: 'serif' },

  // 首页
  greeting: { fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 20, fontFamily: 'serif', lineHeight: 32 },
  createCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: C.border, marginBottom: 28 },
  createIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: C.bgPage, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: C.border },
  createTitle: { fontSize: 16, fontWeight: '600', color: C.text, marginBottom: 4, fontFamily: 'serif' },
  createDesc: { fontSize: 13, color: C.text3, fontFamily: 'serif' },
  arrow: { fontSize: 28, color: C.text3, fontWeight: '300' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: C.text, marginBottom: 16, fontFamily: 'serif' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addBtn: { fontSize: 14, color: C.primary, fontWeight: '600', fontFamily: 'serif' },

  // 书籍卡片
  bookCard: { backgroundColor: C.bgCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  bookCover: { width: '100%', height: 200 },
  bookInfo: { padding: 16 },
  bookArchiveNo: { fontSize: 11, color: C.text3, marginBottom: 4, fontFamily: 'serif', letterSpacing: 1 },
  bookTitle: { fontSize: 16, fontWeight: '600', color: C.text, marginBottom: 4, fontFamily: 'serif' },
  bookMeta: { fontSize: 12, color: C.text3, fontFamily: 'serif' },

  // 空状态
  emptyBox: { alignItems: 'center', paddingVertical: 48, backgroundColor: C.bgCard, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  emptyIconBox: { width: 80, height: 80, borderRadius: 20, backgroundColor: C.bgPage, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.border },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: C.text, marginBottom: 8, fontFamily: 'serif' },
  emptyDesc: { fontSize: 14, color: C.text3, fontFamily: 'serif', lineHeight: 22 },

  // 上传
  uploadCard: { alignItems: 'center', backgroundColor: C.bgCard, padding: 40, borderRadius: 20, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', marginTop: 16, marginBottom: 16 },
  uploadIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: C.bgPage, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.border },
  uploadTitle: { fontSize: 16, fontWeight: '600', color: C.text, marginBottom: 4, fontFamily: 'serif' },
  uploadDesc: { fontSize: 13, color: C.text3, fontFamily: 'serif' },

  // 照片网格
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoItem: { width: (SCREEN_WIDTH - 48) / 2, aspectRatio: 1, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  photoImg: { width: '100%', height: '100%' },
  photoIdx: { position: 'absolute', top: 8, left: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  photoIdxT: { color: '#FFF', fontSize: 12, fontWeight: '600', fontFamily: 'serif' },
  photoDel: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },

  // 讲故事
  storyImg: { width: '100%', height: 260, borderRadius: 16, marginBottom: 16 },
  storyIndex: { fontSize: 13, color: C.text3, textAlign: 'center', marginBottom: 16, fontFamily: 'serif' },
  charCount: { fontSize: 12, color: C.text3, textAlign: 'right', marginTop: 8, fontFamily: 'serif' },
  input: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 16, height: 56, fontSize: 16, color: C.text, fontFamily: 'serif' },

  // 底部栏
  footer: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: C.bgCard, borderTopWidth: 1, borderTopColor: C.border },
  footerText: { fontSize: 13, color: C.text3, marginRight: 16, fontFamily: 'serif' },

  // 入藏动画
  genCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  genBook: { width: 160, height: 210, marginBottom: 48 },
  genCover: { width: '100%', height: '100%', borderRadius: 4, backgroundColor: C.primaryDark, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.borderGold },
  genSpine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 20, backgroundColor: 'rgba(0,0,0,0.3)', borderRightWidth: 1, borderRightColor: C.borderGold },
  genTitle: { fontSize: 28, fontWeight: 'bold', color: C.gold, fontFamily: 'serif', marginBottom: 4 },
  genSub: { fontSize: 12, color: C.gold, opacity: 0.6, fontFamily: 'serif' },
  phases: { width: '100%', marginBottom: 32 },
  phaseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  phaseText: { fontSize: 15, color: 'rgba(255,255,255,0.5)', fontFamily: 'serif' },
  progressBar: { width: 200, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.gold, borderRadius: 2 },

  // 阅读器
  readerPage: { backgroundColor: C.bgCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  readerImg: { width: '100%', height: 300 },
  readerStory: { padding: 20 },
  readerStoryT: { fontSize: 16, color: C.text, lineHeight: 28, fontFamily: 'serif' },
  coverPage: { height: 400, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  coverImg: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  coverInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 },
  coverArchiveNo: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 8, fontFamily: 'serif' },
  coverTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', fontFamily: 'serif', marginBottom: 8 },
  coverSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontFamily: 'serif' },
  certPage: { backgroundColor: C.bgCard, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  certLabel: { fontSize: 12, color: C.text3, marginBottom: 16, fontFamily: 'serif' },
  certTitle: { fontSize: 24, fontWeight: 'bold', color: C.text, marginBottom: 16, fontFamily: 'serif' },
  certDesc: { fontSize: 15, color: C.text2, lineHeight: 26, textAlign: 'center', marginBottom: 24, fontFamily: 'serif' },
  certDivider: { width: 60, height: 1, backgroundColor: C.gold, marginBottom: 24 },
  certOwner: { fontSize: 18, fontWeight: '600', color: C.text, marginBottom: 8, fontFamily: 'serif' },
  certMeta: { fontSize: 12, color: C.text3, fontFamily: 'serif' },
  pageDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  dotActive: { width: 24, backgroundColor: C.primary },
  pageNum: { fontSize: 13, color: C.text3, textAlign: 'center', fontFamily: 'serif' },

  // 分享
  shareCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
  shareCover: { width: 72, height: 96, borderRadius: 8 },
  tipBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F6FFED', borderRadius: 16, padding: 16, marginTop: 24 },
  tipText: { fontSize: 13, color: '#52C41A', flex: 1, lineHeight: 22, fontFamily: 'serif' },

  // 收藏馆
  collCard: { flex: 1, backgroundColor: C.bgCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 12 },
  collCover: { width: '100%', height: 180 },
  collInfo: { padding: 12 },

  // 求助
  helpInfo: { alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 20, padding: 32, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
  helpIconBox: { width: 80, height: 80, borderRadius: 20, backgroundColor: C.bgPage, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.border },
  childCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  childAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  childAvatarT: { color: '#FFF', fontSize: 18, fontWeight: '600', fontFamily: 'serif' },
  childName: { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 2, fontFamily: 'serif' },
  childPhone: { fontSize: 13, color: C.text3, fontFamily: 'serif' },
  childBtn: { padding: 8, marginLeft: 4 },

  // 菜单
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  menuTitle: { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 2, fontFamily: 'serif' },
  menuDesc: { fontSize: 13, color: C.text3, fontFamily: 'serif' },

  // 个人主页
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgCard, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
  profileAvatar: { width: 72, height: 72, borderRadius: 36 },

  // 弹窗
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: C.bgCard, borderRadius: 20, padding: 24 },
});
