import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {  Mail, Phone, MapPin, Calendar } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <div className="w-full">
      <Card className="bg-card border-border">
        <CardHeader className="pb-1">
          <div className="flex items-center space-x-4">
            
            <div>
              <CardTitle className="text-xl">John Doe</CardTitle>
              <p className="text-sm text-muted-foreground">Software Engineer</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-2 w-4 text-muted-foreground" />
            <span>January 1, 1990</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-2 w-4 text-muted-foreground" />
            <span>New York, USA</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-2 w-4 text-muted-foreground" />
            <span>john.doe@example.com</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-2 w-4 text-muted-foreground" />
            <span>+1 234 567 8900</span>
          </div>
          <div className="pt-1">
            <h4 className="text-sm font-medium mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Node.js</Badge>
              <Badge variant="secondary">Python</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;