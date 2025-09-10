"use client";

interface BanterLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const sizeConfig = {
  sm: { container: 48, box: 14, margin: 4 },
  md: { container: 72, box: 20, margin: 6 },
  lg: { container: 96, box: 28, margin: 8 },
};

export function BanterLoader({ size = "md", color }: BanterLoaderProps) {
  // 如果沒有指定顏色，使用 CSS 變數來支援主題切換
  const loaderColor = color || "hsl(var(--foreground))";
  const config = sizeConfig[size];

  return (
    <>
      <div
        className="banter-loader"
        style={{
          position: "relative",
          width: config.container,
          height: config.container,
        }}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className="banter-loader__box"
            style={{
              position: "absolute",
              width: config.box,
              height: config.box,
              left: (i % 3) * (config.box + config.margin),
              top: Math.floor(i / 3) * (config.box + config.margin),
            }}
          />
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .banter-loader__box:before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: ${loaderColor};
            border-radius: 2px;
          }

          .banter-loader__box:nth-child(1):before, 
          .banter-loader__box:nth-child(4):before {
            transform: translateX(${config.box + config.margin}px);
          }

          .banter-loader__box:nth-child(3):before {
            transform: translateY(${(config.box + config.margin) * 2}px);
          }

          @keyframes moveBox-1 {
            9.0909090909% { transform: translate(-${config.box + config.margin}px, 0); }
            18.1818181818% { transform: translate(0px, 0); }
            27.2727272727% { transform: translate(0px, 0); }
            36.3636363636% { transform: translate(${config.box + config.margin}px, 0); }
            45.4545454545% { transform: translate(${config.box + config.margin}px, ${config.box + config.margin}px); }
            54.5454545455% { transform: translate(${config.box + config.margin}px, ${config.box + config.margin}px); }
            63.6363636364% { transform: translate(${config.box + config.margin}px, ${config.box + config.margin}px); }
            72.7272727273% { transform: translate(${config.box + config.margin}px, 0px); }
            81.8181818182% { transform: translate(0px, 0px); }
            90.9090909091% { transform: translate(-${config.box + config.margin}px, 0px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes moveBox-2 {
            9.0909090909% { transform: translate(0, 0); }
            18.1818181818% { transform: translate(${config.box + config.margin}px, 0); }
            27.2727272727% { transform: translate(0px, 0); }
            36.3636363636% { transform: translate(${config.box + config.margin}px, 0); }
            45.4545454545% { transform: translate(${config.box + config.margin}px, ${config.box + config.margin}px); }
            54.5454545455% { transform: translate(${config.box + config.margin}px, ${config.box + config.margin}px); }
            63.6363636364% { transform: translate(${config.box + config.margin}px, ${config.box + config.margin}px); }
            72.7272727273% { transform: translate(${config.box + config.margin}px, ${config.box + config.margin}px); }
            81.8181818182% { transform: translate(0px, ${config.box + config.margin}px); }
            90.9090909091% { transform: translate(0px, ${config.box + config.margin}px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes moveBox-3 {
            9.0909090909% { transform: translate(-${config.box + config.margin}px, 0); }
            18.1818181818% { transform: translate(-${config.box + config.margin}px, 0); }
            27.2727272727% { transform: translate(0px, 0); }
            36.3636363636% { transform: translate(-${config.box + config.margin}px, 0); }
            45.4545454545% { transform: translate(-${config.box + config.margin}px, 0); }
            54.5454545455% { transform: translate(-${config.box + config.margin}px, 0); }
            63.6363636364% { transform: translate(-${config.box + config.margin}px, 0); }
            72.7272727273% { transform: translate(-${config.box + config.margin}px, 0); }
            81.8181818182% { transform: translate(-${config.box + config.margin}px, -${config.box + config.margin}px); }
            90.9090909091% { transform: translate(0px, -${config.box + config.margin}px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes moveBox-4 {
            9.0909090909% { transform: translate(-${config.box + config.margin}px, 0); }
            18.1818181818% { transform: translate(-${config.box + config.margin}px, 0); }
            27.2727272727% { transform: translate(-${config.box + config.margin}px, -${config.box + config.margin}px); }
            36.3636363636% { transform: translate(0px, -${config.box + config.margin}px); }
            45.4545454545% { transform: translate(0px, 0px); }
            54.5454545455% { transform: translate(0px, -${config.box + config.margin}px); }
            63.6363636364% { transform: translate(0px, -${config.box + config.margin}px); }
            72.7272727273% { transform: translate(0px, -${config.box + config.margin}px); }
            81.8181818182% { transform: translate(-${config.box + config.margin}px, -${config.box + config.margin}px); }
            90.9090909091% { transform: translate(-${config.box + config.margin}px, 0px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes moveBox-5 {
            9.0909090909% { transform: translate(0, 0); }
            18.1818181818% { transform: translate(0, 0); }
            27.2727272727% { transform: translate(0, 0); }
            36.3636363636% { transform: translate(${config.box + config.margin}px, 0); }
            45.4545454545% { transform: translate(${config.box + config.margin}px, 0); }
            54.5454545455% { transform: translate(${config.box + config.margin}px, 0); }
            63.6363636364% { transform: translate(${config.box + config.margin}px, 0); }
            72.7272727273% { transform: translate(${config.box + config.margin}px, 0); }
            81.8181818182% { transform: translate(${config.box + config.margin}px, -${config.box + config.margin}px); }
            90.9090909091% { transform: translate(0px, -${config.box + config.margin}px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes moveBox-6 {
            9.0909090909% { transform: translate(0, 0); }
            18.1818181818% { transform: translate(-${config.box + config.margin}px, 0); }
            27.2727272727% { transform: translate(-${config.box + config.margin}px, 0); }
            36.3636363636% { transform: translate(0px, 0); }
            45.4545454545% { transform: translate(0px, 0); }
            54.5454545455% { transform: translate(0px, 0); }
            63.6363636364% { transform: translate(0px, 0); }
            72.7272727273% { transform: translate(0px, ${config.box + config.margin}px); }
            81.8181818182% { transform: translate(-${config.box + config.margin}px, ${config.box + config.margin}px); }
            90.9090909091% { transform: translate(-${config.box + config.margin}px, 0px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes moveBox-7 {
            9.0909090909% { transform: translate(${config.box + config.margin}px, 0); }
            18.1818181818% { transform: translate(${config.box + config.margin}px, 0); }
            27.2727272727% { transform: translate(${config.box + config.margin}px, 0); }
            36.3636363636% { transform: translate(0px, 0); }
            45.4545454545% { transform: translate(0px, -${config.box + config.margin}px); }
            54.5454545455% { transform: translate(${config.box + config.margin}px, -${config.box + config.margin}px); }
            63.6363636364% { transform: translate(0px, -${config.box + config.margin}px); }
            72.7272727273% { transform: translate(0px, -${config.box + config.margin}px); }
            81.8181818182% { transform: translate(0px, 0px); }
            90.9090909091% { transform: translate(${config.box + config.margin}px, 0px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes moveBox-8 {
            9.0909090909% { transform: translate(0, 0); }
            18.1818181818% { transform: translate(-${config.box + config.margin}px, 0); }
            27.2727272727% { transform: translate(-${config.box + config.margin}px, -${config.box + config.margin}px); }
            36.3636363636% { transform: translate(0px, -${config.box + config.margin}px); }
            45.4545454545% { transform: translate(0px, -${config.box + config.margin}px); }
            54.5454545455% { transform: translate(0px, -${config.box + config.margin}px); }
            63.6363636364% { transform: translate(0px, -${config.box + config.margin}px); }
            72.7272727273% { transform: translate(0px, -${config.box + config.margin}px); }
            81.8181818182% { transform: translate(${config.box + config.margin}px, -${config.box + config.margin}px); }
            90.9090909091% { transform: translate(${config.box + config.margin}px, 0px); }
            100% { transform: translate(0px, 0px); }
          }

          @keyframes moveBox-9 {
            9.0909090909% { transform: translate(-${config.box + config.margin}px, 0); }
            18.1818181818% { transform: translate(-${config.box + config.margin}px, 0); }
            27.2727272727% { transform: translate(0px, 0); }
            36.3636363636% { transform: translate(-${config.box + config.margin}px, 0); }
            45.4545454545% { transform: translate(0px, 0); }
            54.5454545455% { transform: translate(0px, 0); }
            63.6363636364% { transform: translate(-${config.box + config.margin}px, 0); }
            72.7272727273% { transform: translate(-${config.box + config.margin}px, 0); }
            81.8181818182% { transform: translate(-${(config.box + config.margin) * 2}px, 0); }
            90.9090909091% { transform: translate(-${config.box + config.margin}px, 0); }
            100% { transform: translate(0px, 0); }
          }

          .banter-loader__box:nth-child(1) { animation: moveBox-1 4s infinite; }
          .banter-loader__box:nth-child(2) { animation: moveBox-2 4s infinite; }
          .banter-loader__box:nth-child(3) { animation: moveBox-3 4s infinite; }
          .banter-loader__box:nth-child(4) { animation: moveBox-4 4s infinite; }
          .banter-loader__box:nth-child(5) { animation: moveBox-5 4s infinite; }
          .banter-loader__box:nth-child(6) { animation: moveBox-6 4s infinite; }
          .banter-loader__box:nth-child(7) { animation: moveBox-7 4s infinite; }
          .banter-loader__box:nth-child(8) { animation: moveBox-8 4s infinite; }
          .banter-loader__box:nth-child(9) { animation: moveBox-9 4s infinite; }
        `,
        }}
      />
    </>
  );
}
