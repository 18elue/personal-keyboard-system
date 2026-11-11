# Obsidian 快捷键核对记录

文档类型：研究记录。核对日期：2026-11-09（Asia/Shanghai）。记录本次证据和验证边界，不代表以后版本或其他仓库的状态。当前键位建议维护于[对照表](../shortcut-map.md#当前统一建议)。

## 核对范围与方法

- 本机应用日志最近加载的应用包为 Obsidian 1.15.0；从该包只读核对核心命令的默认绑定和编辑器相关键位文本，没有运行提取出的应用代码。
- 从 `~/Library/Application Support/obsidian/obsidian.json` 定位已登记仓库；重点核对当前标记为打开的 Haleon 仓库的 `.obsidian` 配置与已启用插件。
- 读取 macOS 的 `com.apple.symbolichotkeys.plist`，检查已启用条目中是否存在 Control + Shift + D/W/M/Y；读取全局及 Obsidian 偏好中的菜单快捷键覆盖。
- 对照 [Obsidian Hotkeys](https://obsidian.md/help/hotkeys)、[编辑快捷键](https://obsidian.md/help/editing-shortcuts)、[Periodic Notes 作者说明](https://github.com/liamcain/obsidian-periodic-notes)及 [Apple 快捷键说明](https://support.apple.com/en-us/102650)。

上述本机资料不随本仓库分发；没有复制笔记正文、插件业务数据或应用源码。

## 当时的仓库配置

- Haleon 仓库未发现 `.obsidian/hotkeys.json`，因此没有从该文件加载的自定义命令绑定。
- 启用的社区插件为 Tasks、Periodic Notes、Calendar、QuickAdd；核对其本机代码时未发现静态 `hotkeys:` 默认绑定字段。这不证明插件运行时绝无其他按键处理。
- Periodic Notes 版本为 0.0.17，Calendar 版本为 1.5.10。
- Periodic Notes 的 daily 与 weekly 已开启；monthly 未开启。核心 Daily notes 未开启。
- Workbench 仓库也未发现 `hotkeys.json`，但未发现已启用的社区插件列表；本次周记建议针对 Haleon，不推及该仓库。

## 核心默认绑定摘要

以下是本机 1.15.0 应用包的静态命令声明核对结果，不是完整快捷键清单。macOS 下 `Mod` 对应 Command，`Alt` 对应 Option；上下文可影响命令是否执行。

| 类别 | 默认绑定及含义 |
| --- | --- |
| 内容入口 | `⌘O` 快速切换笔记；`⌘P` 命令面板 |
| 查找 | `⌘F` 当前内容查找；`⌘⇧F` 跨文件搜索；`⌘⌥F` 当前内容替换 |
| 创建 | `⌘N` 新建笔记；`⌘⇧N` 在右侧新建笔记；`⌘T` 新建标签 |
| 关闭与恢复 | `⌘W` 关闭当前标签；`⌘⇧W` 关闭窗口；`⌘⇧T` 恢复关闭标签 |
| 标签导航 | `⌃Tab` / `⌃⇧Tab` 下一 / 上一标签；另有 `⌘⇧]` / `⌘⇧[` |
| 位置定位 | `⌘1…8` 定位当前组的标签；`⌘9` 最后标签 |
| 导航历史 | `⌘⌥← / →` 后退 / 前进，不能直接当作标签切换 |
| 编辑 | `⌘B` 加粗；`⌘I` 斜体；`⌘K` 插入链接；`⌘D` 删除段落；`⌘L` 切换任务状态 |
| 内容与设置 | `⌘E` 切换编辑 / 阅读；`⌘G` 打开图谱；`⌘,` 设置 |

核心命令绑定中未发现 `⌃⇧W` 或同组 D/M/Y 的默认绑定；对编辑器中的相关按键字面量也进行了定向检查，没有找到这些组合。定向静态检查不等价于枚举运行时所有作用域和系统文本控件行为。

## 周记命令核对

本机 Periodic Notes 根据周期生成命令，周记命令 ID 为 `periodic-notes:open-weekly-note`，显示名为 `Open weekly note`。命令定义没有提供默认快捷键。

该命令按当前时间打开本周笔记，不存在时会创建；与打开周记文件夹、下一篇周记、上一篇周记不同。此行为也有[作者文档说明](https://github.com/liamcain/obsidian-periodic-notes#open-weekly-note)。本次没有执行该命令或创建笔记。

## 候选比较证据

| 候选 | 本次发现 | 取舍依据 |
| --- | --- | --- |
| `⌘W` | Obsidian 默认关闭标签 | 保留高频关闭操作 |
| `⌘⇧W` | Obsidian 默认关闭窗口 | 保留窗口关闭操作 |
| `⌘⌥W` | macOS 通用约定为关闭 App 的所有窗口 | 即使某个 App 当前未绑定，也不新增覆盖 |
| `⌃⌘W` | 核对的核心命令中未发现占用 | 单独作为周记候选可行，但若用同组 D 打开日记，会遇到 macOS `⌃⌘D` 查词约定 |
| `⌃⇧W` | 本次静态检查未发现相关默认 / 自定义占用，系统符号快捷键中也无匹配 | 同组 D/M/Y 的检查结果同样未发现占用，可作为周期笔记组候选 |

这是结合已有绑定、语义记忆和扩展空间做的设计比较，不能证明某个组合对所有用户都最优。

## 验证边界

- 查询过 Obsidian CLI 的 `hotkeys` 和 `commands` 只读接口，但应用返回 CLI 尚未启用，没有获得运行时绑定清单；本次未启用该功能。
- 系统检查仅涵盖上述偏好文件和候选组合，未完整枚举第三方全局热键工具或输入法的内部绑定。
- 未进行真实按键、焦点切换、输入法、手感及周记打开行为测试。
- 未修改 App、系统或仓库中的实际快捷键配置，未启停或安装插件。

采用前应在 Haleon 的快捷键设置中再次检查冲突，并分别从正文编辑、搜索框和阅读视图触发验证。日后启用月记或其他插件时，重新核对对应成员。

## 后续配置核对（2026-11-09，用户设置后）

用户告知已将 Control + Shift + W 设置为打开周记的快捷键。随后只读核对 Haleon 的 `.obsidian/hotkeys.json`，确认新增绑定已保存。

实际命令为 `quickadd:choice:0aca374e-ebf1-48b1-a0fe-d7cafd1ab4dc`，其绑定为 `Ctrl` + `Shift` + `W`；同一配置文件中未发现其他命令使用该组合。再核对 QuickAdd 的 `data.json`，该选择项名为 **Open Weekly Notes**，类型为 Template，并已暴露为命令。

此次配置核对后，前文“未发现 hotkeys.json”和“候选未占用”仍保留为设置前的研究证据；当前采用状态以[对照表](../shortcut-map.md#当前统一建议)为准。此前建议的 Periodic Notes 命令没有在这次配置中获得该绑定。

本次确认的是用户已采用及本机绑定已保存，没有执行 QuickAdd 命令，也没有进行真实按键、模板创建、已存在周记打开或不同焦点的行为验证。未修改 Obsidian 配置。
