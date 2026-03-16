import { useState, useMemo } from 'react'
import {
  Pie,
  Bar,
  Line,
  ResponsiveContainer,
  Legend,
  Tooltip,
  PieChart,
  BarChart,
  LineChart,
  Cell,
  XAxis,
  YAxis
} from 'recharts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useTimeEntryStore } from '@/stores/timeEntryStore'
import { useCategoryStore } from '@/stores/categoryStore'
import {
  formatDuration,
  formatDurationHHMM,
  getTimeRanges,
  groupByCategory,
  calculateAverageByWeekday,
  calculateMonthlyData,
  calculateDailyData,
  filterEntriesByCategories
} from '@/lib/analytics'
import { Calendar, ChevronDown, Filter, PieChart as PieChartIcon, TrendingUp, Clock } from 'lucide-react'

function AnalyticsPage() {
  const { timeEntries } = useTimeEntryStore()
  const { categories } = useCategoryStore()

  // State für Filter
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('this-week')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  // Filtere Einträge basierend auf Zeitbereich
  const filteredEntries = useMemo(() => {
    const timeRange = getTimeRanges().find(r => r.value === selectedTimeRange)
    if (!timeRange) return timeEntries

    const { start, end } = timeRange.getDates()
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.startTime)
      return entryDate >= start && entryDate <= end
    })
  }, [timeEntries, selectedTimeRange])

  // gefilterte Einträge nach Kategorien
  const categorizedEntries = useMemo(() => {
    return filterEntriesByCategories(filteredEntries, selectedCategoryIds.length > 0 ? selectedCategoryIds : categories.map(c => c.id))
  }, [filteredEntries, selectedCategoryIds, categories])

  // Berechnungen
  const totalTime = useMemo(() => {
    return formatDuration(categorizedEntries.reduce((sum, entry) => {
      const start = new Date(entry.startTime).getTime()
      const end = entry.endTime ? new Date(entry.endTime).getTime() : Date.now()
      return sum + Math.floor((end - start) / 1000)
    }, 0))
  }, [categorizedEntries])

  const totalEntries = useMemo(() => {
    return categorizedEntries.length
  }, [categorizedEntries])

  const categoriesWithTime = useMemo(() => {
    return groupByCategory(categorizedEntries, categories)
  }, [categorizedEntries, categories])

  // Pie Chart Daten
  const pieData = useMemo(() => {
    return categoriesWithTime.map((item, index) => {
      // Bestimme Farbe
      let color = item.category.color
      if (!color) {
        const keywords = ['work', 'arbeit', 'beruf']
        if (keywords.some(k => item.category.name.toLowerCase().includes(k))) {
          color = '#3b82f6'
        } else {
          const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6']
          color = colors[index % colors.length]
        }
      }
      return {
        name: item.category.name,
        value: item.totalSeconds,
        color: color,
        emoji: item.category.emoji
      }
    })
  }, [categoriesWithTime])

  // Wochentags-Daten
  const weekdayData = useMemo(() => {
    return calculateAverageByWeekday(categorizedEntries)
  }, [categorizedEntries])

  // Monatliche Daten für Trend
  const monthlyData = useMemo(() => {
    return calculateMonthlyData(timeEntries, 6)
  }, [timeEntries])

  // Tägliche Daten für Trend
  const dailyData = useMemo(() => {
    return calculateDailyData(categorizedEntries, 7)
  }, [categorizedEntries])

  // Kategorien-Checkbox Handler
  const toggleCategory = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== categoryId))
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, categoryId])
    }
  }

  // Alle Kategorien auswählen
  const selectAllCategories = () => {
    setSelectedCategoryIds(categories.map(c => c.id))
  }

  // Keine Kategorien auswählen
  const clearCategories = () => {
    setSelectedCategoryIds([])
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription className="mt-1">
                Detaillierte Auswertungen und Trends
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {/* Zeitbereich Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {getTimeRanges().find(r => r.value === selectedTimeRange)?.label}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Zeitbereich wählen</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getTimeRanges().map(range => (
                    <DropdownMenuCheckboxItem
                      key={range.value}
                      checked={selectedTimeRange === range.value}
                      onCheckedChange={() => setSelectedTimeRange(range.value)}
                    >
                      {range.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-center md:justify-start gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Gesamtzeit</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {totalTime}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Aktivitäten</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {totalEntries}
                </p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Kategorien</p>
                <p className="text-2xl md:text-3xl font-bold">
                  {categoriesWithTime.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter: Kategorien */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Kategorien filtern
            </CardTitle>
            <CardDescription>
              Wähle Kategorien aus, die in der Analyse berücksichtigt werden sollen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllCategories}
              >
                Alle
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCategories}
              >
                Keine
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Kategorien auswählen
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto">
                  <DropdownMenuLabel>Kategorien</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categories.map(category => (
                    <DropdownMenuCheckboxItem
                      key={category.id}
                      checked={selectedCategoryIds.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    >
                      <span className="mr-2">{category.emoji}</span>
                      {category.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Haupt-Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Zeitverteilung (Pie Chart) */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Zeitverteilung
              </CardTitle>
              <CardDescription>
                Aufteilung nach Kategorien
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent && (percent * 100).toFixed(0)) || '0'}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="transition-all duration-300"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatDuration(value as number)}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Wochentags-Durchschnitt */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Wochentags-Auswertung
              </CardTitle>
              <CardDescription>
                Durchschnittliche Arbeitszeit pro Wochentag
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData}>
                  <Bar dataKey="averageSeconds" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {weekdayData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.count > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                        className="transition-all duration-300"
                      />
                    ))}
                  </Bar>
                  <Tooltip
                    formatter={(value) => formatDuration(value as number)}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <XAxis
                    dataKey="weekday"
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(value) => formatDuration(value as number)}
                    tick={{ fontSize: 12 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monatliche und tägliche Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monatlicher Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monatlicher Trend
              </CardTitle>
              <CardDescription>
                Entwicklung über die letzten 6 Monate
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Tooltip
                    formatter={(value) => formatDuration(value as number)}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(value) => formatDuration(value as number)}
                    tick={{ fontSize: 12 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Täglicher Trend (Woche) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Wöchentlicher Trend
              </CardTitle>
              <CardDescription>
                Tägliche Arbeitszeit der letzten 7 Tage
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  >
                    {dailyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                        className="transition-all duration-300"
                      />
                    ))}
                  </Bar>
                  <Tooltip
                    formatter={(value) => formatDuration(value as number)}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(value) => formatDuration(value as number)}
                    tick={{ fontSize: 12 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabellarische Übersicht */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tabellarische Übersicht
            </CardTitle>
            <CardDescription>
              Detaillierte Auflistung nach Kategorien
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoriesWithTime.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl bg-muted/20">
                <p className="text-muted-foreground text-lg">Keine Einträge für diesen Zeitraum</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Ändere den Zeitbereich oder Kategorienfilter, um Daten zu sehen
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {categoriesWithTime.map((item) => (
                  <div
                    key={item.category.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{item.category.emoji}</span>
                      <div>
                        <h3 className="font-medium">{item.category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {categoriesWithTime.length > 1
                            ? `${(((item.totalSeconds / categoriesWithTime.reduce((sum, c) => sum + c.totalSeconds, 0)) * 100) || 0).toFixed(1)}% der Gesamtzeit`
                            : '100% der Gesamtzeit'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatDurationHHMM(item.totalSeconds)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(item.totalSeconds)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage
