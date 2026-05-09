import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Cpu,
  Factory,
  Gauge,
  HeartHandshake,
  Play,
  Radar,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  Trophy,
  Upload,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  Radar as RadarShape,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Track = 'industrial' | 'care'
type Language = 'en' | 'zh'

type Robot = {
  id: string
  name: string
  vendor: string
  model: string
  track: Track
  status: string
  payloadKg: number
  heightCm: number
  batteryHr: number
  link: string
  scores: Record<'mobility' | 'manipulation' | 'autonomy' | 'safety' | 'endurance' | 'hri', number>
}

type Task = {
  id: string
  name: string
  weight: number
  difficulty: string
  target: string
}

const robots: Robot[] = [
  {
    id: 'apollo',
    name: 'Apptronik Apollo',
    vendor: 'Apptronik',
    model: 'Apollo',
    track: 'industrial',
    status: 'Pilot deployments',
    payloadKg: 25,
    heightCm: 173,
    batteryHr: 4,
    link: 'https://apptronik.com/apollo',
    scores: { mobility: 83, manipulation: 78, autonomy: 74, safety: 81, endurance: 69, hri: 58 },
  },
  {
    id: 'figure02',
    name: 'Figure 02',
    vendor: 'Figure',
    model: 'Figure 02',
    track: 'industrial',
    status: 'Factory pilots',
    payloadKg: 20,
    heightCm: 168,
    batteryHr: 5,
    link: 'https://www.figure.ai',
    scores: { mobility: 86, manipulation: 84, autonomy: 79, safety: 77, endurance: 74, hri: 61 },
  },
  {
    id: 'optimus',
    name: 'Tesla Optimus',
    vendor: 'Tesla',
    model: 'Optimus',
    track: 'industrial',
    status: 'Internal development',
    payloadKg: 20,
    heightCm: 173,
    batteryHr: 6,
    link: 'https://www.tesla.com/AI',
    scores: { mobility: 88, manipulation: 76, autonomy: 75, safety: 73, endurance: 81, hri: 57 },
  },
  {
    id: 'walker',
    name: 'UBTECH Walker S1',
    vendor: 'UBTECH',
    model: 'Walker S1',
    track: 'industrial',
    status: 'Automotive line trials',
    payloadKg: 15,
    heightCm: 172,
    batteryHr: 3.5,
    link: 'https://www.ubtrobot.com/en/humanoid/products/walker-s1',
    scores: { mobility: 79, manipulation: 75, autonomy: 71, safety: 78, endurance: 67, hri: 55 },
  },
  {
    id: 'gr3',
    name: 'Fourier GR-3',
    vendor: 'Fourier',
    model: 'GR-3',
    track: 'care',
    status: 'Showcase / pilot',
    payloadKg: 6,
    heightCm: 165,
    batteryHr: 2.5,
    link: 'https://www.fftai.com/products-gr3',
    scores: { mobility: 72, manipulation: 66, autonomy: 68, safety: 88, endurance: 58, hri: 87 },
  },
]

const benchmarkSuites: Record<Track, Task[]> = {
  industrial: [
    { id: 'bin-pick', name: 'Bin Picking', weight: 18, difficulty: 'High', target: 'Random cluttered part extraction' },
    { id: 'line-feed', name: 'Line Feeding', weight: 16, difficulty: 'Medium', target: 'Move totes to workstation under takt time' },
    { id: 'stair-ramp', name: 'Stair & Ramp Traverse', weight: 12, difficulty: 'Medium', target: 'Mobility across mixed terrain' },
    { id: 'tool-handover', name: 'Tool Handover', weight: 14, difficulty: 'Medium', target: 'Human-safe passing with force limits' },
    { id: 'fault-recovery', name: 'Fault Recovery', weight: 20, difficulty: 'High', target: 'Resume task after occlusion / slip / event' },
    { id: 'endurance-shift', name: 'Shift Endurance', weight: 20, difficulty: 'High', target: 'Long-run stability and energy efficiency' },
  ],
  care: [
    { id: 'room-navigation', name: 'Room Navigation', weight: 14, difficulty: 'Medium', target: 'Indoor traversal around furniture and people' },
    { id: 'med-reminder', name: 'Medication Reminder', weight: 15, difficulty: 'Low', target: 'Timely and intelligible prompting' },
    { id: 'assist-fetch', name: 'Assistive Fetch', weight: 18, difficulty: 'Medium', target: 'Bring requested household item safely' },
    { id: 'conversation', name: 'Conversation Quality', weight: 18, difficulty: 'Medium', target: 'Turn-taking, clarity, empathy proxy' },
    { id: 'fall-escalation', name: 'Fall / Alert Escalation', weight: 20, difficulty: 'High', target: 'Detect abnormal state and escalate correctly' },
    { id: 'proximity-safety', name: 'Proximity Safety', weight: 15, difficulty: 'High', target: 'Safe motion around vulnerable users' },
  ],
}

const adoptionTrend = [
  { month: 'M1', submissions: 4, certified: 0, activeUsers: 8 },
  { month: 'M2', submissions: 11, certified: 2, activeUsers: 20 },
  { month: 'M3', submissions: 19, certified: 5, activeUsers: 34 },
  { month: 'M4', submissions: 28, certified: 9, activeUsers: 49 },
  { month: 'M5', submissions: 39, certified: 14, activeUsers: 66 },
  { month: 'M6', submissions: 53, certified: 21, activeUsers: 88 },
  { month: 'M7', submissions: 71, certified: 30, activeUsers: 117 },
  { month: 'M8', submissions: 94, certified: 42, activeUsers: 150 },
]

const arenaPhases = [
  'Scenario loaded',
  'Robot initialized',
  'Perception calibration',
  'Task execution',
  'Recovery / exception check',
  'Audit log generated',
]

const translations = {
  en: {
    languageLabel: 'Language',
    english: 'EN',
    chinese: '中文',
    badges: {
      platform: 'Humanoid Benchmark Platform',
      hybrid: 'Simulation + hybrid-ready',
      mvp: 'Interactive MVP',
    },
    heroTitle: 'A working benchmark product for industrial and care humanoid robots.',
    heroBody:
      'Define suites, run benchmark jobs, compare robots, inspect task logs, and visualize how rankings change under different buyer priorities.',
    runBenchmark: 'Run benchmark',
    submissionWorkflow: 'Submission workflow',
    metrics: {
      robotsTracked: 'Robots tracked',
      humanoidProfiles: 'Humanoid profiles',
      benchmarkTasks: 'Benchmark tasks',
      twoSuites: 'Two suites',
      auditLogs: 'Audit logs',
      traceability: 'Run-level traceability',
      certificationTiers: 'Certification tiers',
      tiers: 'Bronze / Silver / Gold',
      score: 'Score',
    },
    arenaMonitor: 'Arena monitor',
    arenaDesc: 'Mock live run with task execution, recovery, and audit generation.',
    arenaLabels: ['Task zone', 'Obstacle field', 'Audit sensors'],
    ready: 'Ready',
    tabs: {
      dashboard: 'Dashboard',
      runner: 'Runner',
      leaderboard: 'Leaderboard',
      compare: 'Compare',
      workflow: 'Workflow',
    },
    suiteExplorer: 'Suite explorer',
    suiteDesc: 'Switch benchmark lanes and inspect test modules.',
    tracks: {
      industrial: 'Industrial',
      care: 'Care',
      industrialSuite: 'Industrial humanoid suite',
      careSuite: 'Care humanoid suite',
    },
    weight: 'Weight',
    adoptionTrend: 'Adoption trend',
    adoptionDesc: 'Mock platform growth with submissions and certifications.',
    chart: {
      submissions: 'Submissions',
      certified: 'Certified',
      activeUsers: 'Active users',
    },
    runnerTitle: 'Benchmark runner',
    runnerDesc: 'Select track, choose a robot profile, and simulate a scored run.',
    labels: {
      track: 'Track',
      robot: 'Robot',
      currentProfile: 'Current profile',
      payload: 'Payload',
      height: 'Height',
      battery: 'Battery',
      success: 'Success',
      latency: 'Latency',
      safety: 'Safety',
      robustness: 'Robustness',
      rank: 'Rank',
      status: 'Status',
      total: 'Total',
      live: 'Live',
      step: 'Step',
    },
    startSimulatedRun: 'Start simulated run',
    taskResults: 'Task results',
    taskResultsDesc: 'Mock run output with per-task metrics and audit-friendly breakdown.',
    leaderboardTitle: 'Leaderboard',
    leaderboardDesc: 'Filterable results browser with rank, status, and total score.',
    searchPlaceholder: 'Search robot / vendor / model',
    inspect: 'Inspect',
    categoryBreakdown: 'Category score breakdown',
    categoryBreakdownDesc: 'under the current benchmark weighting model.',
    weightingEngine: 'Weighting engine',
    weightingDesc: 'Adjust benchmark priorities and watch rankings update in real time.',
    weightingInfo:
      '{copy.weightingInfo}',
    selectedVsLeader: 'Selected vs current leader',
    selectedVsLeaderDesc: 'Radar comparison under the active track.',
    leader: 'Leader',
    robotCards: 'Robot cards',
    robotCardsDesc: 'Interactive catalog for the active benchmark lane.',
    benchmarkArchitecture: 'Benchmark architecture',
    architectureDesc: 'The core modules a real deployment would expose.',
    usefulTitle: 'What makes this useful',
    usefulDesc: 'Designed to feel like a product, not a concept page.',
    arenaPhases: [
      'Scenario loaded',
      'Robot initialized',
      'Perception calibration',
      'Task execution',
      'Recovery / exception check',
      'Audit log generated',
    ],
    categories: {
      mobility: 'Mobility',
      manipulation: 'Manipulation',
      autonomy: 'Autonomy',
      safety: 'Safety',
      endurance: 'Endurance',
      hri: 'HRI / Care',
    },
    difficulties: {
      High: 'High',
      Medium: 'Medium',
      Low: 'Low',
    },
    statuses: {
      'Pilot deployments': 'Pilot deployments',
      'Factory pilots': 'Factory pilots',
      'Internal development': 'Internal development',
      'Automotive line trials': 'Automotive line trials',
      'Showcase / pilot': 'Showcase / pilot',
    },
    tasks: {
      'bin-pick': { name: 'Bin Picking', target: 'Random cluttered part extraction' },
      'line-feed': { name: 'Line Feeding', target: 'Move totes to workstation under takt time' },
      'stair-ramp': { name: 'Stair & Ramp Traverse', target: 'Mobility across mixed terrain' },
      'tool-handover': { name: 'Tool Handover', target: 'Human-safe passing with force limits' },
      'fault-recovery': { name: 'Fault Recovery', target: 'Resume task after occlusion / slip / event' },
      'endurance-shift': { name: 'Shift Endurance', target: 'Long-run stability and energy efficiency' },
      'room-navigation': { name: 'Room Navigation', target: 'Indoor traversal around furniture and people' },
      'med-reminder': { name: 'Medication Reminder', target: 'Timely and intelligible prompting' },
      'assist-fetch': { name: 'Assistive Fetch', target: 'Bring requested household item safely' },
      conversation: { name: 'Conversation Quality', target: 'Turn-taking, clarity, empathy proxy' },
      'fall-escalation': { name: 'Fall / Alert Escalation', target: 'Detect abnormal state and escalate correctly' },
      'proximity-safety': { name: 'Proximity Safety', target: 'Safe motion around vulnerable users' },
    },
    workflowSteps: [
      ['Submit', 'Upload Docker image, model package, metadata, and claimed runtime profile.'],
      ['Evaluate', 'Run hidden seeds, randomized scenarios, and compute-budget-constrained inference.'],
      ['Audit', 'Generate replay logs, action traces, exceptions, and compliance outputs.'],
      ['Publish', 'Push certified results to the public leaderboard with versioned benchmark tags.'],
    ],
    architectureItems: [
      ['Arena & scenarios', 'Isaac / MuJoCo task worlds, hidden seeds, randomized terrain and clutter.'],
      ['Scoring engine', 'Versioned rules, per-track weighting, traceable score composition.'],
      ['Replay & audit', 'Exception logs, event timeline, run artifacts, tamper checks.'],
      ['Certification layer', 'Bronze / Silver / Gold issuance, buyer-facing summaries.'],
    ],
    usefulItems: [
      ['Dynamic scoring', 'Different buyer priorities can immediately produce different rankings.'],
      ['Comparative views', 'Radar, bars, and task tables make strengths and weaknesses obvious.'],
      ['Run simulation', 'Users can launch a mock job and inspect progress rather than just read text.'],
      ['Result browser', 'Searchable leaderboard and category charts mirror mature benchmark products.'],
    ],
  },
  zh: {
    languageLabel: '语言',
    english: 'EN',
    chinese: '中文',
    badges: {
      platform: '人形机器人评测平台',
      hybrid: '仿真 + 混合评测就绪',
      mvp: '交互式 MVP',
    },
    heroTitle: '面向工业与照护人形机器人的可运行评测产品。',
    heroBody:
      '定义评测套件、运行评测任务、比较机器人表现、查看任务日志，并可视化不同买方优先级下的排名变化。',
    runBenchmark: '运行评测',
    submissionWorkflow: '提交流程',
    metrics: {
      robotsTracked: '已跟踪机器人',
      humanoidProfiles: '人形机器人档案',
      benchmarkTasks: '评测任务',
      twoSuites: '两套评测场景',
      auditLogs: '审计日志',
      traceability: '运行级可追溯',
      certificationTiers: '认证等级',
      tiers: '铜 / 银 / 金',
      score: '得分',
    },
    arenaMonitor: '评测场监控',
    arenaDesc: '模拟实时运行，展示任务执行、异常恢复与审计生成。',
    arenaLabels: ['任务区', '障碍区', '审计传感器'],
    ready: '就绪',
    tabs: {
      dashboard: '总览',
      runner: '运行器',
      leaderboard: '排行榜',
      compare: '对比',
      workflow: '流程',
    },
    suiteExplorer: '套件浏览',
    suiteDesc: '切换评测赛道并查看测试模块。',
    tracks: {
      industrial: '工业',
      care: '照护',
      industrialSuite: '工业人形机器人套件',
      careSuite: '照护人形机器人套件',
    },
    weight: '权重',
    adoptionTrend: '平台增长趋势',
    adoptionDesc: '模拟平台提交量、认证量与活跃用户增长。',
    chart: {
      submissions: '提交量',
      certified: '认证量',
      activeUsers: '活跃用户',
    },
    runnerTitle: '评测运行器',
    runnerDesc: '选择赛道和机器人档案，并模拟一次评分运行。',
    labels: {
      track: '赛道',
      robot: '机器人',
      currentProfile: '当前档案',
      payload: '载重',
      height: '高度',
      battery: '续航',
      success: '成功率',
      latency: '延迟',
      safety: '安全性',
      robustness: '鲁棒性',
      rank: '排名',
      status: '状态',
      total: '总分',
      live: '在线',
      step: '步骤',
    },
    startSimulatedRun: '开始模拟运行',
    taskResults: '任务结果',
    taskResultsDesc: '模拟运行输出，展示每个任务的指标和便于审计的拆解。',
    leaderboardTitle: '排行榜',
    leaderboardDesc: '可筛选的结果浏览器，包含排名、状态和总分。',
    searchPlaceholder: '搜索机器人 / 厂商 / 型号',
    inspect: '查看',
    categoryBreakdown: '类别得分拆解',
    categoryBreakdownDesc: '在当前评测权重模型下的表现。',
    weightingEngine: '权重引擎',
    weightingDesc: '调整评测优先级，并实时查看排名变化。',
    weightingInfo:
      '这个 MVP 使用动态加权评分，展示工业买方和照护买方如何对同一机器人产生不同排名。',
    selectedVsLeader: '所选机器人 vs 当前领先者',
    selectedVsLeaderDesc: '当前赛道下的雷达图对比。',
    leader: '领先者',
    robotCards: '机器人卡片',
    robotCardsDesc: '当前评测赛道的交互式机器人目录。',
    benchmarkArchitecture: '评测架构',
    architectureDesc: '真实部署中会暴露的核心模块。',
    usefulTitle: '为什么有用',
    usefulDesc: '设计成一个产品，而不是单纯的概念展示页。',
    arenaPhases: [
      '场景加载',
      '机器人初始化',
      '感知校准',
      '任务执行',
      '恢复 / 异常检查',
      '生成审计日志',
    ],
    categories: {
      mobility: '移动能力',
      manipulation: '操作能力',
      autonomy: '自主性',
      safety: '安全性',
      endurance: '续航能力',
      hri: '人机交互 / 照护',
    },
    difficulties: {
      High: '高',
      Medium: '中',
      Low: '低',
    },
    statuses: {
      'Pilot deployments': '试点部署',
      'Factory pilots': '工厂试点',
      'Internal development': '内部开发',
      'Automotive line trials': '汽车产线试验',
      'Showcase / pilot': '展示 / 试点',
    },
    tasks: {
      'bin-pick': { name: '料箱抓取', target: '从随机杂乱零件中完成抓取' },
      'line-feed': { name: '产线补料', target: '在节拍时间内将料箱移动到工位' },
      'stair-ramp': { name: '楼梯与坡道通行', target: '跨越混合地形的移动能力' },
      'tool-handover': { name: '工具递交', target: '在力限制下安全递交给人类' },
      'fault-recovery': { name: '故障恢复', target: '在遮挡、打滑或突发事件后恢复任务' },
      'endurance-shift': { name: '班次续航', target: '长时间运行稳定性与能效' },
      'room-navigation': { name: '室内导航', target: '在家具和人员周围安全通行' },
      'med-reminder': { name: '用药提醒', target: '及时、清晰地进行提醒' },
      'assist-fetch': { name: '辅助取物', target: '安全取回指定家居物品' },
      conversation: { name: '对话质量', target: '轮次交替、清晰度与共情代理指标' },
      'fall-escalation': { name: '跌倒 / 警报升级', target: '检测异常状态并正确上报' },
      'proximity-safety': { name: '近距离安全', target: '在脆弱用户周围安全运动' },
    },
    workflowSteps: [
      ['提交', '上传 Docker 镜像、模型包、元数据和声明的运行配置。'],
      ['评估', '运行隐藏种子、随机场景和受算力预算约束的推理。'],
      ['审计', '生成回放日志、动作轨迹、异常记录和合规输出。'],
      ['发布', '将认证结果以版本化评测标签发布到公开排行榜。'],
    ],
    architectureItems: [
      ['场景与评测场', 'Isaac / MuJoCo 任务世界、隐藏种子、随机地形与杂乱环境。'],
      ['评分引擎', '版本化规则、按赛道加权、可追溯的得分构成。'],
      ['回放与审计', '异常日志、事件时间线、运行产物和防篡改检查。'],
      ['认证层', '铜 / 银 / 金认证发放，以及面向买方的摘要结果。'],
    ],
    usefulItems: [
      ['动态评分', '不同买方优先级可以立即产生不同排名。'],
      ['对比视图', '雷达图、柱状图和任务表格让优劣势更直观。'],
      ['运行模拟', '用户可以启动模拟任务并查看进度，而不只是阅读文字。'],
      ['结果浏览器', '可搜索排行榜和类别图表接近成熟评测产品体验。'],
    ],
  },
} as const


function scoreRobot(robot: Robot, weights: Record<string, number>) {
  const s = robot.scores
  return Math.round(
    s.mobility * weights.mobility +
      s.manipulation * weights.manipulation +
      s.autonomy * weights.autonomy +
      s.safety * weights.safety +
      s.endurance * weights.endurance +
      s.hri * weights.hri,
  )
}

function buildTaskResults(robot: Robot, track: Track, suite: Task[]) {
  return suite.map((task, i) => {
    const base =
      track === 'industrial'
        ? (robot.scores.manipulation + robot.scores.mobility + robot.scores.autonomy) / 3
        : (robot.scores.hri + robot.scores.safety + robot.scores.autonomy) / 3
    const variance = ((i + 1) * 7 + robot.name.length) % 13
    const success = Math.max(48, Math.min(97, Math.round(base + variance - 8)))
    const latency = Math.max(1.2, Number((8.8 - base / 18 + i * 0.35).toFixed(1)))
    const safety = Math.max(55, Math.min(98, Math.round((robot.scores.safety + robot.scores.hri) / 2 + (12 - variance))))
    const robustness = Math.max(44, Math.min(96, Math.round((robot.scores.endurance + robot.scores.autonomy) / 2 + variance - 4)))
    return { ...task, success, latency, safety, robustness }
  })
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button className={`tab-button ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

function MetricCard({ icon: Icon, label, value, sub }: { icon: typeof Bot; label: string; value: string; sub: string }) {
  return (
    <div className="metric-card">
      <div className="metric-icon"><Icon size={16} /></div>
      <div>
        <div className="eyebrow">{label}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-sub">{sub}</div>
      </div>
    </div>
  )
}

function App() {
  const [language, setLanguage] = useState<Language>('en')
  const copy = translations[language]
  const getTaskText = (task: Task) =>
    (copy.tasks as Record<string, { name: string; target: string }>)[task.id] ?? { name: task.name, target: task.target }
  const getDifficultyText = (difficulty: string) =>
    (copy.difficulties as Record<string, string>)[difficulty] ?? difficulty
  const getStatusText = (status: string) =>
    (copy.statuses as Record<string, string>)[status] ?? status

  const [tab, setTab] = useState<'dashboard' | 'runner' | 'leaderboard' | 'compare' | 'workflow'>('dashboard')
  const [track, setTrack] = useState<Track>('industrial')
  const [selectedRobotId, setSelectedRobotId] = useState('apollo')
  const [query, setQuery] = useState('')
  const [running, setRunning] = useState(false)
  const [runProgress, setRunProgress] = useState(0)
  const [runStep, setRunStep] = useState(0)
  const [weights, setWeights] = useState({
    mobility: 0.18,
    manipulation: 0.22,
    autonomy: 0.18,
    safety: 0.17,
    endurance: 0.13,
    hri: 0.12,
  })

  const filteredTrackRobots = useMemo(() => robots.filter((r) => r.track === track), [track])

  useEffect(() => {
    if (!filteredTrackRobots.find((r) => r.id === selectedRobotId)) {
      setSelectedRobotId(filteredTrackRobots[0]?.id ?? 'apollo')
    }
  }, [filteredTrackRobots, selectedRobotId])

  const selectedRobot = robots.find((r) => r.id === selectedRobotId) ?? robots[0]
  const suite = benchmarkSuites[track]

  const leaderboard = useMemo(
    () =>
      robots
        .filter((r) => r.track === track)
        .map((r) => ({ ...r, total: scoreRobot(r, weights) }))
        .sort((a, b) => b.total - a.total),
    [track, weights],
  )

  const visibleLeaderboard = useMemo(
    () => leaderboard.filter((r) => `${r.name} ${r.vendor} ${r.model}`.toLowerCase().includes(query.toLowerCase())),
    [leaderboard, query],
  )

  const taskResults = useMemo(() => buildTaskResults(selectedRobot, track, suite), [selectedRobot, track, suite])

  const radarData = useMemo(() => {
    const leader = leaderboard[0] ?? selectedRobot
    return [
      { metric: copy.categories.mobility, selected: selectedRobot.scores.mobility, leader: leader.scores.mobility },
      { metric: copy.categories.manipulation, selected: selectedRobot.scores.manipulation, leader: leader.scores.manipulation },
      { metric: copy.categories.autonomy, selected: selectedRobot.scores.autonomy, leader: leader.scores.autonomy },
      { metric: copy.categories.safety, selected: selectedRobot.scores.safety, leader: leader.scores.safety },
      { metric: copy.categories.endurance, selected: selectedRobot.scores.endurance, leader: leader.scores.endurance },
      { metric: copy.categories.hri, selected: selectedRobot.scores.hri, leader: leader.scores.hri },
    ]
  }, [selectedRobot, leaderboard, language])

  const categoryWeights = [
    { key: 'mobility', label: copy.categories.mobility },
    { key: 'manipulation', label: copy.categories.manipulation },
    { key: 'autonomy', label: copy.categories.autonomy },
    { key: 'safety', label: copy.categories.safety },
    { key: 'endurance', label: copy.categories.endurance },
    { key: 'hri', label: copy.categories.hri },
  ] as const

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setRunProgress((p) => {
        const next = Math.min(100, p + 4 + Math.random() * 7)
        const phaseIndex = Math.min(arenaPhases.length - 1, Math.floor((next / 100) * arenaPhases.length))
        setRunStep(phaseIndex)
        if (next >= 100) {
          window.clearInterval(timer)
          window.setTimeout(() => setRunning(false), 300)
        }
        return next
      })
    }, 240)
    return () => window.clearInterval(timer)
  }, [running])

  const startRun = () => {
    setRunning(true)
    setRunProgress(0)
    setRunStep(0)
    setTab('runner')
  }

  const totalScore = scoreRobot(selectedRobot, weights)

  return (
    <div className="app-shell">
      <div className="container">
        <section className="hero glass-panel">
          <div className="hero-copy">
            <div className="project-logo">
              <img src="/bloomi-robotics-logo.png" alt="Bloomi Robotics logo" />
            </div>
            <div className="language-toggle" aria-label={copy.languageLabel}>
              <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>{copy.english}</button>
              <button className={language === 'zh' ? 'active' : ''} onClick={() => setLanguage('zh')}>{copy.chinese}</button>
            </div>
            <div className="badge-row">
              <span className="badge dark">{copy.badges.platform}</span>
              <span className="badge">{copy.badges.hybrid}</span>
              <span className="badge">{copy.badges.mvp}</span>
            </div>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroBody}</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={startRun}><Play size={16} /> {copy.runBenchmark}</button>
              <button className="secondary-button" onClick={() => setTab('workflow')}><Upload size={16} /> {copy.submissionWorkflow}</button>
            </div>
            <div className="metrics-grid">
              <MetricCard icon={Bot} label={copy.metrics.robotsTracked} value="5" sub={copy.metrics.humanoidProfiles} />
              <MetricCard icon={ClipboardList} label={copy.metrics.benchmarkTasks} value="12" sub={copy.metrics.twoSuites} />
              <MetricCard icon={ShieldCheck} label={copy.metrics.auditLogs} value="100%" sub={copy.metrics.traceability} />
              <MetricCard icon={Trophy} label={copy.metrics.certificationTiers} value="3" sub={copy.metrics.tiers} />
            </div>
          </div>
          <div className="arena-card dark-panel">
            <div className="panel-head">
              <div>
                <div className="panel-title"><Activity size={18} /> {copy.arenaMonitor}</div>
                <div className="panel-desc">{copy.arenaDesc}</div>
              </div>
            </div>
            <div className="arena-stage">
              <div className="zone zone-square" />
              <div className="zone zone-circle" />
              <motion.div
                className="robot-token"
                animate={running ? { x: [0, 46, 82, 128], y: [0, -2, 3, 0] } : { x: 0, y: 0 }}
                transition={{ duration: 4.2, repeat: running ? Infinity : 0, ease: 'easeInOut' }}
              >
                <div className="robot-head" />
                <div className="robot-body" />
              </motion.div>
              <div className="stage-labels">
                <span>{copy.arenaLabels[0]}</span>
                <span>{copy.arenaLabels[1]}</span>
                <span>{copy.arenaLabels[2]}</span>
              </div>
            </div>
            <div className="progress-row">
              <span>{running ? copy.arenaPhases[runStep] : copy.ready}</span>
              <span>{Math.round(runProgress)}%</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${runProgress}%` }} /></div>
            <div className="phase-list">
              {copy.arenaPhases.map((phase, idx) => (
                <div key={phase} className="phase-item">
                  <span>{phase}</span>
                  {idx < runStep || (!running && runProgress === 100) ? (
                    <CheckCircle2 size={16} color="#34d399" />
                  ) : idx === runStep && running ? (
                    <span className="pulse-dot" />
                  ) : (
                    <span className="idle-dot" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="tabs-row glass-panel">
          <div className="tabs-list">
            <TabButton active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>{copy.tabs.dashboard}</TabButton>
            <TabButton active={tab === 'runner'} onClick={() => setTab('runner')}>{copy.tabs.runner}</TabButton>
            <TabButton active={tab === 'leaderboard'} onClick={() => setTab('leaderboard')}>{copy.tabs.leaderboard}</TabButton>
            <TabButton active={tab === 'compare'} onClick={() => setTab('compare')}>{copy.tabs.compare}</TabButton>
            <TabButton active={tab === 'workflow'} onClick={() => setTab('workflow')}>{copy.tabs.workflow}</TabButton>
          </div>
        </section>

        {tab === 'dashboard' && (
          <section className="content-grid two-col">
            <div className="glass-panel section-card">
              <div className="section-head row-between">
                <div>
                  <h2>{copy.suiteExplorer}</h2>
                  <p>{copy.suiteDesc}</p>
                </div>
                <div className="segmented-control">
                  <button className={track === 'industrial' ? 'active' : ''} onClick={() => setTrack('industrial')}>{copy.tracks.industrial}</button>
                  <button className={track === 'care' ? 'active' : ''} onClick={() => setTrack('care')}>{copy.tracks.care}</button>
                </div>
              </div>
              <div className="stack-list">
                {suite.map((task) => (
                  <motion.div key={task.id} whileHover={{ y: -2 }} className="tile">
                    <div>
                      <div className="tile-title">{getTaskText(task).name}</div>
                      <div className="tile-sub">{getTaskText(task).target}</div>
                    </div>
                    <div className="tile-meta">
                      <span className="pill">{getDifficultyText(task.difficulty)}</span>
                      <span>{copy.weight} {task.weight}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="glass-panel section-card chart-card">
              <div className="section-head">
                <h2>{copy.adoptionTrend}</h2>
                <p>{copy.adoptionDesc}</p>
              </div>
              <div className="chart-wrap large">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={adoptionTrend}>
                    <defs>
                      <linearGradient id="submissionsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="submissions" name={copy.chart.submissions} stroke="#3b82f6" fill="url(#submissionsFill)" strokeWidth={2} />
                    <Line type="monotone" dataKey="certified" name={copy.chart.certified} stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="activeUsers" name={copy.chart.activeUsers} stroke="#0f172a" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {tab === 'runner' && (
          <section className="content-grid two-col-runner">
            <div className="glass-panel section-card">
              <div className="section-head">
                <h2>{copy.runnerTitle}</h2>
                <p>{copy.runnerDesc}</p>
              </div>
              <div className="form-stack">
                <label>
                  <span>{copy.labels.track}</span>
                  <select value={track} onChange={(e) => setTrack(e.target.value as Track)}>
                    <option value="industrial">{copy.tracks.industrialSuite}</option>
                    <option value="care">{copy.tracks.careSuite}</option>
                  </select>
                </label>
                <label>
                  <span>{copy.labels.robot}</span>
                  <select value={selectedRobotId} onChange={(e) => setSelectedRobotId(e.target.value)}>
                    {robots.filter((r) => r.track === track).map((robot) => (
                      <option key={robot.id} value={robot.id}>{robot.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="profile-box">
                <div className="row-between">
                  <div>
                    <div className="eyebrow">{copy.labels.currentProfile}</div>
                    <div className="profile-title">{selectedRobot.name}</div>
                  </div>
                  <span className="badge dark">{copy.metrics.score} {totalScore}</span>
                </div>
                <div className="mini-grid three">
                  <div className="mini-tile"><div className="eyebrow">{copy.labels.payload}</div><strong>{selectedRobot.payloadKg} kg</strong></div>
                  <div className="mini-tile"><div className="eyebrow">{copy.labels.height}</div><strong>{selectedRobot.heightCm} cm</strong></div>
                  <div className="mini-tile"><div className="eyebrow">{copy.labels.battery}</div><strong>{selectedRobot.batteryHr} h</strong></div>
                </div>
              </div>
              <button className="primary-button full-width" onClick={startRun}><Play size={16} /> {copy.startSimulatedRun}</button>
            </div>
            <div className="glass-panel section-card">
              <div className="section-head">
                <h2>{copy.taskResults}</h2>
                <p>{copy.taskResultsDesc}</p>
              </div>
              <div className="stack-list">
                {taskResults.map((task) => (
                  <div key={task.id} className="tile task-tile">
                    <div className="row-between start">
                      <div>
                        <div className="tile-title">{task.name}</div>
                        <div className="tile-sub">{task.target}</div>
                      </div>
                      <span className="pill">{copy.weight} {task.weight}%</span>
                    </div>
                    <div className="mini-grid four">
                      <div className="mini-tile"><div className="eyebrow">{copy.labels.success}</div><strong>{task.success}%</strong></div>
                      <div className="mini-tile"><div className="eyebrow">{copy.labels.latency}</div><strong>{task.latency}s</strong></div>
                      <div className="mini-tile"><div className="eyebrow">{copy.labels.safety}</div><strong>{task.safety}</strong></div>
                      <div className="mini-tile"><div className="eyebrow">{copy.labels.robustness}</div><strong>{task.robustness}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === 'leaderboard' && (
          <section className="content-grid two-col">
            <div className="glass-panel section-card">
              <div className="section-head row-between wrap-gap">
                <div>
                  <h2>{copy.leaderboardTitle}</h2>
                  <p>{copy.leaderboardDesc}</p>
                </div>
                <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy.searchPlaceholder} />
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{copy.labels.rank}</th>
                      <th>{copy.labels.robot}</th>
                      <th>{copy.labels.status}</th>
                      <th>{copy.labels.total}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLeaderboard.map((robot, index) => (
                      <tr key={robot.id} onClick={() => setSelectedRobotId(robot.id)}>
                        <td>#{index + 1}</td>
                        <td>
                          <div className="table-title">{robot.name}</div>
                          <div className="table-sub">{robot.vendor} · {robot.model}</div>
                        </td>
                        <td><span className="pill">{getStatusText(robot.status)}</span></td>
                        <td><strong>{robot.total}</strong></td>
                        <td><button className="ghost-button">{copy.inspect} <ChevronRight size={15} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="glass-panel section-card chart-card">
              <div className="section-head">
                <h2>{copy.categoryBreakdown}</h2>
                <p>{selectedRobot.name} {copy.categoryBreakdownDesc}</p>
              </div>
              <div className="chart-wrap large">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryWeights.map((c) => ({ metric: c.label, score: selectedRobot.scores[c.key] }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="metric" angle={-8} textAnchor="end" height={64} interval={0} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" name={copy.metrics.score} radius={[10, 10, 0, 0]} fill="#0f172a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {tab === 'compare' && (
          <section className="content-grid two-col">
            <div className="glass-panel section-card">
              <div className="section-head">
                <h2>{copy.weightingEngine}</h2>
                <p>{copy.weightingDesc}</p>
              </div>
              <div className="slider-stack">
                {categoryWeights.map((item) => (
                  <label key={item.key} className="slider-label">
                    <div className="row-between">
                      <span>{item.label}</span>
                      <strong>{Math.round(weights[item.key] * 100)}%</strong>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={35}
                      step={1}
                      value={Math.round(weights[item.key] * 100)}
                      onChange={(e) => setWeights((prev) => ({ ...prev, [item.key]: Number(e.target.value) / 100 }))}
                    />
                  </label>
                ))}
              </div>
              <div className="info-box">
                {copy.weightingInfo}
              </div>
            </div>
            <div className="stack-split">
              <div className="glass-panel section-card chart-card">
                <div className="section-head">
                  <h2>{copy.selectedVsLeader}</h2>
                  <p>{copy.selectedVsLeaderDesc}</p>
                </div>
                <div className="chart-wrap medium">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <Tooltip />
                      <RadarShape name={selectedRobot.name} dataKey="selected" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                      <RadarShape name={leaderboard[0]?.name ?? copy.leader} dataKey="leader" fill="#10b981" stroke="#10b981" fillOpacity={0.2} strokeWidth={2} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass-panel section-card">
                <div className="section-head">
                  <h2>{copy.robotCards}</h2>
                  <p>{copy.robotCardsDesc}</p>
                </div>
                <div className="robot-grid">
                  {robots.filter((r) => r.track === track).map((robot) => {
                    const active = robot.id === selectedRobotId
                    return (
                      <button key={robot.id} className={`robot-card ${active ? 'active' : ''}`} onClick={() => setSelectedRobotId(robot.id)}>
                        <div className="row-between">
                          <div className="tile-title">{robot.name}</div>
                          <span className={`badge ${active ? 'light' : 'dark'}`}>{scoreRobot(robot, weights)}</span>
                        </div>
                        <div className="table-sub">{robot.vendor} · {robot.model}</div>
                        <div className="mini-grid three compact">
                          <div className="mini-tile"><div className="eyebrow">{copy.labels.payload}</div><strong>{robot.payloadKg}kg</strong></div>
                          <div className="mini-tile"><div className="eyebrow">{copy.labels.battery}</div><strong>{robot.batteryHr}h</strong></div>
                          <div className="mini-tile"><div className="eyebrow">{copy.labels.status}</div><strong>{copy.labels.live}</strong></div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === 'workflow' && (
          <section className="stack-split large-gap">
            <div className="steps-grid">
              {[Upload, Cpu, ShieldCheck, Trophy].map((Icon, i) => {
                const [title, text] = copy.workflowSteps[i]
                return (
                  <div key={title} className="glass-panel step-card">
                    <div className="icon-box"><Icon size={18} /></div>
                    <div className="eyebrow">{copy.labels.step} {i + 1}</div>
                    <div className="tile-title">{title}</div>
                    <div className="tile-sub">{text}</div>
                  </div>
                )
              })}
            </div>
            <section className="content-grid two-col">
              <div className="glass-panel section-card">
                <div className="section-head">
                  <h2>{copy.benchmarkArchitecture}</h2>
                  <p>{copy.architectureDesc}</p>
                </div>
                <div className="robot-grid architecture-grid">
                  {[Factory, SlidersHorizontal, Route, HeartHandshake].map((Icon, i) => {
                    const [title, text] = copy.architectureItems[i]
                    return (
                      <div key={title} className="tile architecture-tile">
                        <div className="icon-box soft"><Icon size={18} /></div>
                        <div className="tile-title">{title}</div>
                        <div className="tile-sub">{text}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="glass-panel section-card">
                <div className="section-head">
                  <h2>{copy.usefulTitle}</h2>
                  <p>{copy.usefulDesc}</p>
                </div>
                <div className="stack-list">
                  {[Gauge, Radar, Timer, BarChart3].map((Icon, i) => {
                    const [title, text] = copy.usefulItems[i]
                    return (
                      <div key={title} className="tile horizontal">
                        <div className="icon-box soft"><Icon size={16} /></div>
                        <div>
                          <div className="tile-title">{title}</div>
                          <div className="tile-sub">{text}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          </section>
        )}
      </div>
    </div>
  )
}

export default App
