'use client';

import { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { Search, MapPin, Star, Phone, Mail, Calendar } from 'lucide-react';
import { HiOutlineUserGroup } from 'react-icons/hi2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAgents } from '@/data/mock-insurance';

export default function AgentsPage({ 
  params 
}: {
  params: Promise<{
    locale: string;
  }>;
}) {
  const { locale } = use(params); 
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAgents = mockAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.location.city.includes(searchTerm) ||
      agent.location.district.includes(searchTerm)
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {locale === 'en' ? 'Find Agent' : '尋找業務員'}
        </h1>
        <p className="text-muted-foreground">
          根據您的地理位置和需求，找到最適合的保險業務專員
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋業務員或地區..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          找到 {filteredAgents.length} 位符合條件的業務專員
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {agent.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.company}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm">{agent.rating}</span>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({agent.reviewCount})
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              {/* Location */}
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                {agent.location.city} {agent.location.district}
              </div>

              {/* Experience */}
              <div className="text-sm">
                <span className="font-medium">經驗：</span>
                {agent.experience} 年
              </div>

              {/* Specialties */}
              <div>
                <div className="text-sm font-medium mb-2">
                  {t('agents.specialties')}
                </div>
                <div className="flex flex-wrap gap-1">
                  {agent.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="text-xs"
                    >
                      {t(`insurance.types.${specialty}`)}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <div className="text-sm font-medium mb-2">語言能力</div>
                <div className="flex flex-wrap gap-1">
                  {agent.languages.map((language) => (
                    <Badge key={language} variant="outline" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-mono">{agent.contactInfo.phone}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-xs break-all">
                    {agent.contactInfo.email}
                  </span>
                </div>
              </div>
            </CardContent>

            <div className="p-6 pt-0 flex gap-2">
              <Button variant="outline" className="flex-1">
                查看檔案
              </Button>
              <Button className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                {t('agents.book_appointment')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-6">
            <HiOutlineUserGroup className="h-24 w-24 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            沒有找到符合條件的業務專員
          </h3>
          <p className="text-muted-foreground mb-4">請嘗試調整搜尋關鍵字</p>
          <Button variant="outline" onClick={() => setSearchTerm('')}>
            清除搜尋
          </Button>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 bg-muted/50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">找不到合適的業務專員？</h2>
        <p className="text-muted-foreground mb-6">
          告訴我們您的需求，我們會為您推薦最適合的保險專家
        </p>
        <Button size="lg">提交需求</Button>
      </div>
    </div>
  );
}
