/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { Star, MapPin, Building2, Phone, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InsuranceProduct, Agent } from "@/types/insurance";
import { getRecommendedAgents } from "@/utils/agent-recommendations";

interface AgentRecommendationModalProps {
  product: InsuranceProduct | null;
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  userLocation?: {
    city: string;
    district: string;
  };
}

export function AgentRecommendationModal({
  product,
  isOpen,
  onClose,
  locale,
  userLocation,
}: AgentRecommendationModalProps) {
  const recommendedAgents = product
    ? getRecommendedAgents({ product, userLocation }, 3)
    : [];

  const getSpecialtyName = (specialty: string) => {
    const specialtyMap = {
      life: locale === "en" ? "Life Insurance" : "壽險",
      health: locale === "en" ? "Health Insurance" : "醫療險",
      accident: locale === "en" ? "Accident Insurance" : "意外險",
      travel: locale === "en" ? "Travel Insurance" : "旅遊險",
      vehicle: locale === "en" ? "Vehicle Insurance" : "車險",
      property: locale === "en" ? "Property Insurance" : "財產險",
    };
    return specialtyMap[specialty as keyof typeof specialtyMap] || specialty;
  };

  const handleContactAgent = (agent: Agent) => {
    // 這裡可以實現聯絡業務員的邏輯，例如打開聊天視窗或跳轉到聯絡頁面
    console.log("Contacting agent:", agent);
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg w-[calc(100vw-2rem)] sm:w-auto">
        <DialogHeader>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <DialogTitle className="text-xl">
                {locale === "en" ? "Recommended Agents" : "推薦業務員"}
              </DialogTitle>
              <DialogDescription>
                {locale === "en"
                  ? `Professional agents for ${product.name}`
                  : `為您推薦 ${product.name} 的專業業務員`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {recommendedAgents.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {locale === "en"
                ? "No agents available"
                : "暫無可推薦的業務員"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {locale === "en"
                ? "We couldn't find any agents for this product at the moment. Please try again later or contact customer service."
                : "目前暫無此產品的業務員可供推薦，請稍後再試或聯絡客服。"}
            </p>
            <Button variant="outline" onClick={onClose}>
              {locale === "en" ? "Close" : "關閉"}
            </Button>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 md:justify-center md:overflow-x-visible">
            {recommendedAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-md transition-shadow w-64 md:w-72 flex-shrink-0">
              <CardHeader className="pb-3 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={agent.avatar} alt={agent.name} />
                    <AvatarFallback className="text-xl">
                      {agent.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="w-full">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-center">{agent.name}</h3>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center justify-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {agent.company}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {agent.location.city} {agent.location.district}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{agent.rating}</span>
                        <span className="text-xs">({agent.reviewCount})</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 mb-3">
                      {agent.specialties.slice(0, 3).map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {getSpecialtyName(specialty)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 text-center">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center justify-center gap-1">
                      <Phone className="h-4 w-4" />
                      {agent.contactInfo.phone}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Mail className="h-4 w-4" />
                      {agent.contactInfo.email}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleContactAgent(agent)}
                    size="sm"
                    className="w-full"
                  >
                    {locale === "en" ? "Contact" : "聯絡"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}