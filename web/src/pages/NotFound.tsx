import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center pt-20">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>404 — Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm">
            <Link to="/">Go to VMs</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
