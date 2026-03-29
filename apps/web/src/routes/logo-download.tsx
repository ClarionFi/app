import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/button'
import { Download } from 'lucide-react'
import { NavBar } from '@/components/nav-bar'

export const Route = createFileRoute('/logo-download')({
  component: LogoDownloadRoute,
})

const TwitterPfpSvg = `
<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="400" height="400" fill="#f97316"/>
<g transform="translate(116, 65) scale(1.6)">
	<path d="M47.8799 79.1164H-5.8271e-05C0.455942 59.0524 3.26794 43.3204 8.43594 31.9204C13.7559 20.3684 21.3559 12.1604 31.2359 7.29637C41.1159 2.43237 53.3519 0.00036478 67.9439 0.00036478C72.8079 0.00036478 78.3559 0.304365 84.5879 0.912367C90.9719 1.36837 97.1279 2.28037 103.056 3.64837V63.8404H75.4679L71.8199 36.2524C68.0199 36.2524 64.5999 36.7084 61.5599 37.6204C58.6719 38.5324 56.2399 40.4324 54.2639 43.3204C52.2879 46.0564 50.7679 50.3124 49.7039 56.0884C48.6399 61.8644 48.0319 69.5404 47.8799 79.1164ZM-5.8271e-05 90.5164H47.8799C48.6399 106.02 51.9079 116.736 57.6839 122.664C63.4599 128.44 72.1239 131.328 83.6759 131.328C87.3239 131.328 90.8199 131.1 94.1639 130.644C97.5079 130.188 101.08 129.656 104.88 129.048V165.072C100.472 166.136 95.1519 166.896 88.9199 167.352C82.6879 167.96 77.1399 168.264 72.2759 168.264C47.1959 168.264 29.0319 161.728 17.7839 148.656C6.68794 135.584 0.759942 116.204 -5.8271e-05 90.5164Z" fill="#ffffff"/>
</g>
</svg>
`

function LogoDownloadRoute() {
  const downloadPng = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Create new image from SVG
    const img = new Image()
    const svgBlob = new Blob([TwitterPfpSvg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)
    
    img.onload = () => {
      // Draw standard SVG onto canvas
      ctx.drawImage(img, 0, 0, 400, 400)
      
      // Export as PNG and trigger download
      const pngUrl = canvas.toDataURL("image/png")
      const a = document.createElement("a")
      a.href = pngUrl
      a.download = "clarionfi-twitter-pfp.png"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <main className="relative min-h-svh overflow-x-hidden bg-background text-foreground">
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-8 md:px-10 md:pt-10">
        <NavBar />
        <div className="flex w-full flex-col items-center justify-center pt-20 text-center">
          <h1 className="mb-4 font-heading text-4xl font-semibold tracking-tight md:text-5xl">Brand Assets</h1>
          <p className="mb-12 max-w-md text-muted-foreground">
            Download the official ClarionFi logo tailored perfectly for the Twitter (X) profile picture dimensions.
          </p>
          
          <div className="flex flex-col items-center space-y-8 rounded-3xl border border-border/70 bg-card/80 p-10 backdrop-blur">
            {/* Displaying preview masked as circle like Twitter does */}
            <div 
              className="overflow-hidden rounded-full border-4 border-background shadow-2xl" 
              style={{ width: 160, height: 160 }} 
              dangerouslySetInnerHTML={{ __html: TwitterPfpSvg }} 
            />
            
            <Button onClick={downloadPng} className="group h-12 px-6">
              <Download className="mr-2 size-4 transition-transform group-hover:-translate-y-0.5" />
              Download Twitter PFP (PNG)
            </Button>
            
            <p className="text-xs text-muted-foreground">400x400px • PNG • Solid Orange Background</p>
          </div>
        </div>
      </div>
    </main>
  )
}
