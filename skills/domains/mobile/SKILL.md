---
name: mobile
description: 移动开发。iOS、Android、SwiftUI、Jetpack Compose、React Native、Flutter、跨平台。当用户提到移动开发、iOS、Android、跨平台时路由到此。
license: MIT
user-invocable: false
disable-model-invocation: false
---

# 移动开发域 · Mobile

```
原生：iOS(SwiftUI/UIKit) | Android(Compose/Kotlin)
跨平台：React Native(JS/TS) | Flutter(Dart)
共通：MVVM / 网络层 / 持久化 / 测试
```

---

## iOS

### SwiftUI

- View：`struct V: View { var body: some View {} }`
- State：`@State`本地 | `@Binding`双向 | `@StateObject`拥有 | `@ObservedObject`引用 | `@EnvironmentObject`全局
- ObservableObject：`@Published` 自动触发 UI 更新
- ViewModifier：`struct M: ViewModifier` + `extension View { func style() }`
- 生命周期：`.task { await }` / `.onAppear` / `.onDisappear`

### UIKit 集成

UIViewControllerRepresentable / UIViewRepresentable 包装至 SwiftUI；Coordinator 处理 delegate。

### Combine

Publisher：`dataTaskPublisher` → `map` → `decode` → `eraseToAnyPublisher`
订阅：`.sink(receiveCompletion:receiveValue:)` + `.store(in: &cancellables)`
常用：`debounce` / `removeDuplicates` / `combineLatest` / `flatMap`
Subject：`PassthroughSubject`(无初始值) / `CurrentValueSubject`(有初始值)

### iOS 架构

MVVM（推荐）：Model(`Codable`) → Repository(`protocol`+`async throws`) → ViewModel(`@MainActor ObservableObject`+`@Published`) → View(`@StateObject`)
VIPER（复杂场景）：View↔Presenter↔Interactor→Entity + Router导航

### 网络/持久化

- APIClient：泛型 `func get<T: Decodable>(_ path:) async throws -> T` + Bearer Token + `enum APIError`
- 持久化：UserDefaults(轻量) | Keychain(敏感) | Core Data | SwiftData(iOS 17+, `@Model`宏)

### iOS Checklist

SwiftUI优先 | `@MainActor`线程安全 | async/await | 依赖注入 | LazyVStack/LazyHStack | 图片NSCache | Keychain存敏感数据 | ViewModel单测+Mock

---

## Android

### Jetpack Compose

- `@Composable fun Screen() {}`
- State：`remember { mutableStateOf() }` | `rememberSaveable` | `derivedStateOf`
- LazyColumn：`items(list, key={it.id})`
- Side Effects：`LaunchedEffect`(协程) | `DisposableEffect`(清理) | `SideEffect`(同步) | `snapshotFlow`(监听)
- Navigation：`NavHost` + `composable(route)` + `navController.navigate()`

### ViewModel + StateFlow

`MutableStateFlow(UiState())` + `.asStateFlow()` + `.update { it.copy() }`
Compose 中：`val uiState by viewModel.uiState.collectAsState()`
UiState data class 封装 loading/error/data。

### Coroutines & Flow

- 协程：`viewModelScope.launch { withContext(Dispatchers.IO) {} }`
- 并发：`coroutineScope { async{} + async{} }`
- Flow：`flow { emit() }` + `.flowOn(IO)` + `.stateIn(scope, WhileSubscribed(5000), initial)`
- 搜索防抖：`.debounce(300).filter{}.flatMapLatest{}`
- Channel：`Channel<Event>(BUFFERED)` + `.receiveAsFlow()` 一次性事件

### Hilt 依赖注入

`@HiltAndroidApp` + `@AndroidEntryPoint` + `@Module @InstallIn(SingletonComponent)` + `@Provides @Singleton` / `@Binds`
ViewModel：`@HiltViewModel class VM @Inject constructor(repo)` + `hiltViewModel()`

### Room

Entity(`@Entity`+`@PrimaryKey`) → DAO(`@Query`/`@Insert(REPLACE)`/`@Delete` 返回 `Flow<List<T>>`) → Database(`@Database`+`Room.databaseBuilder`)

### Retrofit 网络层

ApiService：`@GET`/`@POST`/`@Path`/`@Query`/`@Body`/`@Multipart` + AuthInterceptor + OkHttpClient

### Android Checklist

Compose优先 | StateFlow替代LiveData | Hilt注入 | Room持久化 | key优化LazyColumn | remember/derivedStateOf防重组 | Coil图片+缓存 | ViewModel单测(runTest)

---

## 跨平台

| 维度 | React Native | Flutter |
|------|--------------|---------|
| 语言 | TypeScript | Dart |
| 渲染 | 原生组件(桥接) | 自绘(Skia) |
| 热重载 | Fast Refresh | Hot Reload |
| 生态 | npm(成熟) | pub.dev(快速增长) |
| UI一致性 | 跟随系统 | 完全一致 |
| 包体积 | ~7MB | ~15MB |

### React Native 核心

函数组件+Hooks(useState/useEffect/useCallback/useMemo) | FlatList+keyExtractor | @react-navigation | Redux Toolkit/Zustand | NativeModules桥接 | React.memo/Hermes/JSI

### Flutter 核心

StatelessWidget/StatefulWidget | Provider(`ChangeNotifier`+`Consumer`) / Riverpod(推荐,`ref.watch`) | go_router | MethodChannel桥接 | `const`构造/`ListView.builder`/`RepaintBoundary`

### 选型

Web背景→RN | 极致性能/动画→Flutter | UI高度定制→Flutter | 大量原生交互→RN | 极致原生体验→原生

### 跨平台 Checklist

选型匹配团队 | 列表优化(FlatList/ListView.builder+key) | 状态管理(RTK/Riverpod) | 原生桥接验证 | 包体积优化 | 冷启动<1.5s/渲染>55fps

---

## 通用最佳实践

| 实践 | 说明 |
|------|------|
| MVVM | 分离 UI/业务/数据 |
| 依赖注入 | Hilt / Protocol / Context |
| 响应式状态 | StateFlow / Combine / Hooks / Riverpod |
| 网络封装 | 统一错误+Token+重试 |
| 持久化 | Room / Core Data / AsyncStorage / Hive |
| 列表优化 | 懒加载+稳定key+缓存 |
| 测试 | ViewModel单测+UI关键流程 |

## 触发词

iOS、SwiftUI、UIKit、Combine、Android、Jetpack Compose、Kotlin、React Native、Flutter、跨平台、移动开发、MVVM
