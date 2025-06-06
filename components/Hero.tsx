"use client"
import { Button } from "./ui/button"
import { ArrowRight, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

const adContents = [
  { title: "这不是bug，这是特性！", description: "别的用户就能关掉小广告", cta: "了解更多" },
  { title: "开发者大会", description: "加入Noishi年度盛会", cta: "报名参加" },
]

const FloatingAd: React.FC<{ children: React.ReactNode; position: { x: number; y: number }; onMove: () => void }> = ({ children, position, onMove }) => {
  return (
    <div
      className="absolute w-40 h-40 bg-white text-purple-700 p-4 rounded-lg shadow-lg flex flex-col justify-between items-center text-center transition-all duration-500 ease-in-out z-50"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMove()
        }}
        aria-label="关闭"
        title="关闭广告"
        className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 transition-all duration-200 ease-in-out p-1"
      >
        <X size={16} />
      </button>
      <div className="w-full h-full flex flex-col justify-between pt-4">{children}</div>
    </div>
  )
}

export function Hero() {
  const [currentPage, setCurrentPage] = useState(0)
  const [titleText, setTitleText] = useState("")
  const [广告开关, set广告开关] = useState("开")
  const [closeCounts, setCloseCounts] = useState<{ [key: number]: number }>({})
  const [visibleAds, setVisibleAds] = useState(
    adContents.map((content, index) => ({
      ...content,
      position: { x: index * 200, y: 0 },
      visible: true,
      key: index,
    })),
  )

  const pages = [
    {
      title: "Noishi 社区愿景",
      description: "收购腾讯，打造全球最大的开源聊天机器人生态系统",
    },
    {
      title: "欢迎使用 Noishi",
      description: "强大、灵活、异步的跨平台&跨语言聊天机器人框架，为您的创意赋能",
    },
  ]

  useEffect(() => {
    let i = 0
    const fullTitle = pages[currentPage].title
    setTitleText("")

    const typingInterval = setInterval(() => {
      if (i < fullTitle.length) {
        setTitleText((prev) => fullTitle.slice(0, i + 1))
        i++
      } else {
        clearInterval(typingInterval)
      }
    }, 100)

    return () => clearInterval(typingInterval)
  }, [currentPage])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % pages.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setVisibleAds((prevAds) => {
        const newAds = [...prevAds]
        // Move the first ad
        const ad1X = Math.max(0, Math.min(window.innerWidth - 160, newAds[0].position.x + (Math.random() - 0.5) * 100))
        const ad1Y = Math.max(0, Math.min(window.innerHeight - 160, newAds[0].position.y + (Math.random() - 0.5) * 100))
        newAds[0].position = { x: ad1X, y: ad1Y }

        // Move the second ad
        const ad2X = Math.max(0, Math.min(window.innerWidth - 160, newAds[1].position.x + (Math.random() - 0.5) * 100))
        const ad2Y = Math.max(0, Math.min(window.innerHeight - 160, newAds[1].position.y + (Math.random() - 0.5) * 100))
        newAds[1].position = { x: ad2X, y: ad2Y }

        return newAds
      })
    }, 1000) // Move every second

    return () => clearInterval(moveInterval)
  }, [])

  useEffect(() => {
    // 暴露广告开关到全局
    if (!Object.prototype.hasOwnProperty.call(window, "广告开关")) {
      Object.defineProperty(window, "广告开关", {
        get: () => 广告开关,
        set: (value) => set广告开关(value),
      })
    }
  }, [广告开关])

  const handleMoveAd = (key: number) => {
    setCloseCounts(prev => {
      const newCount = (prev[key] || 0) + 1
      // 达到10次关闭，隐藏该广告
      if (newCount >= 10) {
        setVisibleAds((prevAds) =>
          prevAds.map((ad) =>
            ad.key === key ? { ...ad, visible: false } : ad
          )
        )
      }
      return { ...prev, [key]: newCount }
    })
    setVisibleAds((prevAds) => {
      const newAds = [...prevAds]
      const adIndex = newAds.findIndex((ad) => ad.key === key)
      if (adIndex !== -1) {
        // Generate a new random position
        const newX = Math.random() * (window.innerWidth - 160)
        const newY = Math.random() * (window.innerHeight - 160)
        newAds[adIndex].position = { x: newX, y: newY }
      }
      return newAds
    })
  }

  return (
    <section className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white min-h-[calc(100vh-4rem)] flex items-center relative overflow-hidden z-0">
      {广告开关 === "开" &&
        visibleAds.filter(ad => ad.visible).map((ad) => (
          <FloatingAd key={ad.key} position={ad.position} onMove={() => handleMoveAd(ad.key)}>
            <h3 className="font-bold text-sm">{ad.title}</h3>
            <p className="text-xs my-2">{ad.description}</p>
            <Button size="sm" className="w-full">
              {ad.cta}
            </Button>
          </FloatingAd>
        ))}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight min-h-[1.2em] relative">
          <span className="absolute left-0 right-0">{titleText}</span>
          <span className="invisible">{pages[currentPage].title}</span>
          <span className="animate-blink absolute">|</span>
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed text-purple-100 animate-float">
          {pages[currentPage].description}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Button
            size="lg"
            className="w-full sm:w-auto transition-transform hover:scale-105 bg-white text-purple-700 hover:bg-purple-100 shadow-md hover:shadow-lg animate-fade-in"
            onClick={() => window.open("https://koishi.chat/zh-CN/manual/starter/", "_blank")}
          >
            立即开始
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            className="w-full sm:w-auto transition-transform hover:scale-105 bg-white text-purple-700 hover:bg-purple-100 shadow-md hover:shadow-lg animate-fade-in delay-200"
            onClick={() => window.open("https://koishi.chat", "_blank")}
          >
            查看文档
          </Button>
        </div>
      </div>
    </section>
  )
}

