# 移动开发详细参考

## iOS

### SwiftUI

View：`struct V: View { var body: some View {} }`
State：`@State`本地 | `@Binding`双向 | `@StateObject`拥有 | `@ObservedObject`引用 | `@EnvironmentObject`全局
生命周期：`.task { await }` / `.onAppear` / `.onDisappear`
ViewModifier：`struct M: ViewModifier` + `extension View { func style() }`

### Combine

`dataTaskPublisher` → `map` → `decode` → `eraseToAnyPublisher`
订阅：`.sink(receiveCompletion:receiveValue:)` + `.store(in: &cancellables)`
常用：`debounce` / `removeDuplicates` / `combineLatest` / `flatMap`

### iOS 架构

MVVM：Model(`Codable`) → Repository(`protocol`+`async throws`) → ViewModel(`@MainActor ObservableObject`+`@Published`) → View(`@StateObject`)
网络：泛型 `func get<T: Decodable>(_ path:) async throws -> T` + Bearer Token
持久化：UserDefaults(轻量) | Keychain(敏感) | SwiftData(iOS 17+, `@Model`宏) | Core Data

## Android

### Jetpack Compose

`@Composable fun Screen() {}` | State：`remember { mutableStateOf() }` | `rememberSaveable`
LazyColumn：`items(list, key={it.id})` | Side Effects：`LaunchedEffect` | `DisposableEffect`
Navigation：`NavHost` + `composable(route)` + `navController.navigate()`

### ViewModel + StateFlow

`MutableStateFlow(UiState())` → `.asStateFlow()` → `.update { it.copy() }`
Compose：`val uiState by viewModel.uiState.collectAsState()`

### Coroutines

`viewModelScope.launch { withContext(Dispatchers.IO) {} }` | `coroutineScope { async{} + async{} }`
Flow：`.flowOn(IO)` + `.stateIn(scope, WhileSubscribed(5000), initial)` | 防抖：`.debounce(300).flatMapLatest{}`

### Hilt + Room

Hilt：`@HiltAndroidApp` + `@AndroidEntryPoint` + `@HiltViewModel class VM @Inject constructor(repo)`
Room：`@Entity` → `@Dao`(`@Query`/`@Insert(REPLACE)` 返回 `Flow<List<T>>`) → `@Database`

## 跨平台

| 维度 | React Native | Flutter |
|------|--------------|---------|
| 渲染 | 原生组件(桥接) | 自绘(Skia) |
| 热重载 | Fast Refresh | Hot Reload |
| UI 一致性 | 跟随系统 | 完全一致 |

RN：函数组件+Hooks | FlatList+keyExtractor | @react-navigation | Redux Toolkit/Zustand | Hermes/JSI
Flutter：StatelessWidget/StatefulWidget | Riverpod(`ref.watch`) | go_router | MethodChannel 桥接 | `const`构造+`ListView.builder`

### 选型

Web 背景→RN | 极致动画/UI 定制→Flutter | 大量原生交互→RN | 极致原生体验→原生
