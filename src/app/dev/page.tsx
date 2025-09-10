"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParticleSphere } from "@/components/ui/particle-sphere";
import { BanterLoader } from "@/components/ui/banter-loader";
import {
  Loading,
  SearchLoading,
  ContentLoading,
} from "@/components/ui/loading";

export default function DevPage() {
  const [particleCount, setParticleCount] = useState(5000);
  const [floatingParticleCount, setFloatingParticleCount] = useState(10000);
  const [sphereRadius, setSphereRadius] = useState(2);
  const [animationSpeed, setAnimationSpeed] = useState(0.01);
  const [sphereColor, setSphereColor] = useState("#3b82f6");

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">開發測試頁面</h1>
        <p className="text-muted-foreground">
          用於測試自定義組件效果的開發頁面
        </p>
      </div>

      <hr className="border-t border-border" />

      {/* Particle Sphere Demo */}
      <Card>
        <CardHeader>
          <CardTitle>粒子球體組件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="particle-count">
                  球體粒子數量: {particleCount}
                </Label>
                <Input
                  id="particle-count"
                  type="range"
                  min="500"
                  max="10000"
                  step="500"
                  value={particleCount}
                  onChange={(e) => setParticleCount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floating-particle-count">
                  懸浮粒子數量: {floatingParticleCount}
                </Label>
                <Input
                  id="floating-particle-count"
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={floatingParticleCount}
                  onChange={(e) =>
                    setFloatingParticleCount(Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sphere-radius">球體半徑: {sphereRadius}</Label>
                <Input
                  id="sphere-radius"
                  type="range"
                  min="1"
                  max="4"
                  step="0.1"
                  value={sphereRadius}
                  onChange={(e) => setSphereRadius(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="animation-speed">
                  動畫速度: {animationSpeed}
                </Label>
                <Input
                  id="animation-speed"
                  type="range"
                  min="0"
                  max="0.05"
                  step="0.005"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sphere-color">球體顏色</Label>
                <Input
                  id="sphere-color"
                  type="color"
                  value={sphereColor}
                  onChange={(e) => setSphereColor(e.target.value)}
                />
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 鼠標移動可以控制球體旋轉</p>
                <p>• 球體表面有靜態的粒子分布</p>
                <p>• 懸浮粒子在球體周圍緩慢漂浮</p>
                <p>• 球體會輕微自轉展示3D效果</p>
                <p>• 所有粒子隨機分布</p>
              </div>
            </div>

            {/* Sphere Display */}
            <div className="flex justify-center items-center h-full">
              <div className="border rounded-lg p-4 bg-black/5 dark:bg-white/5">
                <ParticleSphere
                  width={350}
                  height={350}
                  particleCount={particleCount}
                  floatingParticleCount={floatingParticleCount}
                  radius={sphereRadius}
                  color={sphereColor}
                  animationSpeed={animationSpeed}
                  label="Loading..."
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Loading Animation Test */}
      <Card>
        <CardHeader>
          <CardTitle>新載入動畫測試</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium">小尺寸</h3>
              <BanterLoader size="sm" color="#3b82f6" />
            </div>

            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium">中尺寸</h3>
              <BanterLoader size="md" color="#ef4444" />
            </div>

            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium">大尺寸</h3>
              <BanterLoader size="lg" color="#10b981" />
            </div>
          </div>

          <hr className="border-t border-border" />

          <div className="space-y-6">
            <h3 className="text-lg font-medium">Loading 組件測試</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-4">一般載入</h4>
                <Loading message="載入中" size="sm" />
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-4">搜尋載入</h4>
                <SearchLoading />
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-4">內容載入</h4>
                <ContentLoading />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Components Test */}
      <Card>
        <CardHeader>
          <CardTitle>基礎組件測試</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="default">Default Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="link">Link Button</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
