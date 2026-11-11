# VS Code 与 Obsidian 文本编辑统一方案

文档类型：当前方案与应用指南。更新日期：2026-11-09（Asia/Shanghai）。本文件负责正文编辑的意图、取舍与应用方法；整体进展维护于 [README](../README.md#当前状态)。配置项以所链接的 JSON 和脚本为准。

## 当前目标与状态

用户要求 VS Code 与 Obsidian 的文本编辑统一。本方案以 macOS 通用操作为基础，保留用户已在 VS Code 采用的选词和选到行末习惯，优先处理有误删风险的键位差异。

适用范围是有焦点的正文编辑器，Obsidian 包括 Source mode 与 Live Preview 中的普通文本。查找框、终端、阅读视图、表格单元格、Markdown 格式化和代码语义命令需要分别验证，不自动套用正文规则。

当前状态：方案、配置片段和适配脚本已准备；真实应用配置尚未更新。本机的 VS Code 用户设置目录与 Obsidian 仓库均不在当前环境可写范围内，所以本轮提供可合并的工作区文件及应用步骤。没有安装新插件。

## 操作目标

以下是统一目标，不表示两个 App 已完成实测验收。

| 意图 | 目标快捷键 | 来源与选择依据 | 实现与边界 |
| --- | --- | --- | --- |
| 剪切 / 复制 / 粘贴已选内容 | `⌘X` / `⌘C` / `⌘V` | macOS 通用约定，保留已有肌肉记忆；不为统一重新分配标准剪贴板键 | 沿用共同默认；无选区时的剪贴板行为另测 |
| 撤销 / 重做 | `⌘Z` / `⌘⇧Z` | 通用约定与组内派生：保留撤销原键，加 Shift 表达对应的反向恢复 | 沿用共同默认；撤销分组由编辑器决定 |
| 全选 | `⌘A` | 通用约定；A 可联想 All；与当前词、当前行的局部选择区分 | 沿用共同默认，作用于当前焦点 |
| 按字符选择 | `⇧← / →` | 通用约定与派生：方向键移动一字符，加 Shift 保持起点并扩展选区 | 沿用共同默认 |
| 按词移动 / 选择 | `⌥← / →`、`⌥⇧← / →` | macOS 文本导航约定：横向移动组中 Option 表示词粒度，Shift 继续表示扩选 | 保留各编辑器现有词边界，不改 `editor.wordSeparators` |
| 到行首 / 行末并扩选 | `⌘← / →`、`⌘⇧← / →` | 通用约定与派生：横向 Command 导航到行边界，加 Shift 扩选；与词粒度导航区分 | 沿用共同默认；自动折行的边界另测 |
| 到文档开头 / 末尾并扩选 | `⌘↑ / ↓`、`⌘⇧↑ / ↓` | 通用约定与派生：纵向 Command 导航到文档边界，加 Shift 扩选；与行边界导航成组 | 沿用共同默认 |
| 删除前一个词 | `⌥Backspace` | macOS 约定：删除键决定动作，Option 与按词导航共享词粒度，避免逐字符删除 | 沿用共同默认；使用各自词边界 |
| 删除到行首 | `⌘Backspace` | macOS 编辑惯例：删除键决定动作，Command 表达向行边界删除；不与含换行的整行删除混同 | 沿用共同默认；空行及行首行为另测 |
| 选中当前词，再追加下一匹配 | `⌘D` | 沿用 VS Code 惯例及用户已采用的操作；保留连续多选效率。D 不具有可独立推导的“单词”含义 | VS Code 保留；Obsidian 使用现有 QuickAdd 的脚本适配，先移除原删除绑定 |
| 选中当前逻辑行 | `⌘L` | 沿用 VS Code 惯例；L 可联想 Line，与选词、全选形成对象层次；该联想不是对字母历史来源的断言 | VS Code 保留；Obsidian 使用 QuickAdd 脚本适配，原任务状态命令保留在命令面板 |
| 删除当前逻辑行 | `⌘⇧K` | 沿用 VS Code 原生整行删除组合，保持其工作流；这是惯例例外，不从 Command + K 或 Shift 的含义推导 | VS Code 添加编辑器内优先绑定以处理 Kimi 冲突；Obsidian 原删除段落命令重绑，其本机实现调用 `deleteLine` |
| 上移 / 下移当前行 | `⌥↑ / ↓` | 沿用 VS Code 惯例，方向键表达行的目标位置，成对选择；Option 在此组标识编辑器行移动，不代表全局通用规则 | VS Code 保留；Obsidian 绑定内置移动行命令；须评估段落导航习惯以及 Markdown 列表、多选行为 |
| 当前内容查找 / 替换 | `⌘F` / `⌘⌥F` | 保留共同默认；F 可联想 Find，Option 在此操作组表示相关的替换变体；不推广为 macOS 所有 App 的统一替换约定 | 沿用共同默认；查询面板内的导航另行核对 |

这些规则统一的是操作意图。语言定义的单词、折行、Markdown 表格和列表结构仍可能有行为差异，不能只根据同键宣称完全一致。Expand Selection 是结构扩选，暂不映射到 Obsidian 的单词或行选择。

### 为什么保留选词与删除行的原生组合

选词组合的主要理由是用户已经采用它，且 VS Code 原生支持首次选词及继续追加匹配；若换键，需要改变已有习惯，但不会因此消除 Obsidian 的能力缺口。代价是该字母没有直观的 Word 语义，并且 Obsidian 必须移走原删除绑定、增加选择入口。这是保留既有工作流的选择，不是唯一合理的字母分配。按词向右扩选从光标位置开始，不能替代光标在词内部时向两侧选中当前词。

整行删除组合的主要理由是保留 VS Code 的现成功能与默认键位。代价是三个修饰 / 主键的记忆负担、本机 Kimi 冲突及 Obsidian 重绑定，因此仍是待应用验证的统一候选。不能把 K 的某个英文联想当成设计来源，也不能声称 Shift 是对 Command + K 的删除扩展。剪切会改变剪贴板，删除到行首只删除光标左侧；两者都不能直接替代不改变剪贴板的整行删除。

选择依据的权重是系统习惯、用户已有的高频习惯、跨 App 适配成本与语义可推导性共同决定的。当前方案允许少量明确标注的惯例例外，不能把这些例外说成全部可以从一套修饰键语法推导。上述 macOS 约定见 [Apple 说明](https://support.apple.com/en-us/102650)，编辑器惯例见 [VS Code 默认键位](https://code.visualstudio.com/docs/reference/default-keybindings)。

## 需要解决的冲突

文本编辑优先于 AI 插件或 Markdown 专属动作。在正文编辑中，用于选择的键不能同时执行删除操作。

- Obsidian 原生 `⌘D` 删除段落，改由统一的删除行键触发；`⌘D` 改为选择。
- Obsidian 原生 `⌘L` 切换任务状态；该动作仍可通过命令面板调用，为统一选行入口移除其原键。
- Kimi Code 声明的键与 VS Code 原生删除行键冲突。工作区片段只在可编辑正文有焦点时优先执行删除行；其他上下文不新增覆盖。
- 用户现有 VS Code `⌘⇧G` 跳转定义绑定保持原样，本阶段不把它宣称为跨 App 的查找上一项统一键。

## 应用方法

操作前分别保留现有 VS Code `keybindings.json` 与 Obsidian `hotkeys.json` 的副本。所有片段都用于合并，不能覆盖整份文件；用户现有周记绑定和其他自定义项应保留。

### VS Code

打开 Preferences: Open Keyboard Shortcuts (JSON)，将 [VS Code 配置片段](../configs/vscode/text-editing.keybindings.json)中的条目合并到现有数组末尾。若同一自定义条目已存在，修改该条目而不是重复添加。

这利用用户绑定的优先级解决 Kimi 冲突，不修改扩展源码。已有原生选择、移动和撤销操作无需重新添加绑定。

### Obsidian（Haleon 仓库）

优先在 Settings → Hotkeys 中调整；[原生命令配置片段](../configs/obsidian/text-editing.hotkeys.json)给出了准确命令 ID 和目标绑定。该 JSON 片段只覆盖列出的原生命令，不包含 QuickAdd 新建命令的动态 ID。

1. 将 [选词 / 下一匹配脚本](../configs/obsidian/select-word-or-next.js)与[选行脚本](../configs/obsidian/select-line.js)复制到 Obsidian 仓库中的普通目录，例如 `Scripts/Keyboard/`。脚本需要位于仓库内且不能放进 `.obsidian` 或隐藏目录。
2. 在已启用的 QuickAdd 中新建两个 Macro choice，分别命名为 `Text: Select word or next match` 和 `Text: Select line`。每个宏仅添加一个 User Script 步骤，分别选择对应脚本；关闭启动时自动运行，并开启 Add to command palette（闪电按钮）。
3. 在 Obsidian Hotkeys 中，将原生 Delete paragraph 的键改为片段中的目标键；移除 Toggle checkbox status 的原键，再把两个 QuickAdd 宏分别绑定到上表的选词和选行键。若设置仍显示重复绑定，先解决重复，再实际触发。
4. 按片段设置原生 Move line up / Move line down。已有命令的自定义绑定如需保留，可在目标数组中保留额外条目，但不能继续保留上述选择 / 删除冲突。
5. 回到正文，按下一节验收。脚本只在编辑器有焦点时操作，直接通过宏快捷键触发；从失去编辑器焦点的设置界面或命令面板执行时可能按设计不作操作。

QuickAdd 宏会生成自己的命令 ID，因此通过 UI 将新宏绑定到目标键；不要复制周记宏 ID，也不要编造一个不存在的 Obsidian 原生命令。

## 脚本的明确行为

选词脚本通过公开的 `Editor.wordAt` 取得词范围，通过 `setSelections` 改变选区；没有文件写入、网络访问或文本修改。空光标先选词；已有相同文本选区时，追加后面的一个不重叠的字面匹配，末尾会回绕，已有选区不重复加入。多个不同文本的选区不会猜测下一项。

脚本不是 VS Code 语言服务的完整复刻：初始词范围取自 Obsidian；后续匹配区分大小写且按字面子串查找，不继承 VS Code 的查找面板、整词模式或其他扩展状态。严格整词匹配、语法感知选择和不同语言词边界尚未统一。

选行脚本按源文本的逻辑行选择，包括存在的换行符；重复触发可向下一行扩选，最后一行没有换行时不会凭空补入。多选和反向选区有逻辑测试，尚未验证 Obsidian 表格编辑器等特殊上下文。

## 验证与回退

脚本逻辑检查运行：`node --test tests/select-word-or-next.test.js`。它使用公开 Editor 接口的替身检查选区变化和文本不变，不代表真实 App、QuickAdd 加载或快捷键分发已通过测试。

真实应用依次验证：

1. 在临时文本里测试 `jobs jobs jobs` 的初次选词、连续追加和回绕；再测 `abc-dft-qwe`。确认选择操作不会删除或修改正文。
2. 用 `a`、`b`、`c` 三行测试选行、删除行、撤销及上移 / 下移，再测试空行、文末、选中多行、反向选区和自动折行。
3. 分别检查 Obsidian Source mode 与 Live Preview；搜索框、设置窗口和终端中不应误操作先前的正文。
4. 在 VS Code 正文中验证删除行由编辑器处理；可用 Developer: Toggle Keyboard Shortcuts Troubleshooting 查看实际命令。

回退时先移除两个 QuickAdd 宏的快捷键，再恢复本次改动的 Obsidian 原生命令绑定，最后移除宏与脚本；恢复 VS Code 本次添加的条目即可。不要整体重置其他键位。若使用备份恢复，先确认备份之后是否有其他需要保留的改动。

## 采用与研究记录（2026-11-09）

- 用户此前已确认在 VS Code 使用选词与选到行末操作，并保留现有词边界；当前统一方案延续这项决定，扩展到 Obsidian 的部分仍待应用。
- 用户报告 Obsidian 的原选词键会删除当前行；本机命令名为 Delete paragraph，调用 `deleteLine`。普通行、折行与 Markdown 特殊上下文的等价性仍需分别测试。较早默认绑定证据见 [Obsidian 核对记录](records/2026-11-09-obsidian-shortcuts.md#核心默认绑定摘要)。
- 本机 Kimi Code 0.8.4 与 0.9.0 的扩展清单均声明 `kimi.focusInput` 的 macOS 绑定为 `cmd+shift+k`，与用户的冲突报告一致；没有另外确认当前运行时版本。
- 本机 Obsidian 1.15.0 核心命令中未找到可配置的选词、下一匹配或选行命令；移动行与删除命令存在。仅仅打包了 CodeMirror searchKeymap 不能证明该映射在编辑器中启用，方案不依赖这一假设。
- 本机已有 QuickAdd 2.33.1。其用户脚本可作为现有功能入口复用，所以无需为这次适配新增插件。

来源：[VS Code 默认键位](https://code.visualstudio.com/docs/reference/default-keybindings)、[VS Code 自定义绑定与冲突](https://code.visualstudio.com/docs/configure/keybindings)、[Obsidian 编辑快捷键](https://obsidian.md/help/editing-shortcuts)、[Obsidian Hotkeys](https://obsidian.md/help/hotkeys)、[公开 Editor API 定义](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)、[QuickAdd 用户脚本](https://quickadd.obsidian.guide/docs/UserScripts/)、[QuickAdd 宏配置](https://quickadd.obsidian.guide/docs/Choices/MacroChoice/)。
