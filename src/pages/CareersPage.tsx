import PublicPageLayout from "@/layouts/PublicPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase } from "lucide-react";

const openings = [
  { title: "Senior Full-Stack Engineer", location: "Remote", type: "Full-time", dept: "Engineering" },
  { title: "AI/ML Engineer", location: "Remote", type: "Full-time", dept: "Engineering" },
  { title: "Product Designer", location: "Remote", type: "Full-time", dept: "Design" },
  { title: "Developer Advocate", location: "Remote", type: "Full-time", dept: "Marketing" },
  { title: "Customer Success Manager", location: "Remote", type: "Full-time", dept: "Operations" },
];

const CareersPage = () => (
  <PublicPageLayout>
    <div className="container max-w-3xl space-y-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">Careers at Chetti</h1>
        <p className="text-lg text-muted-foreground">
          Join us in building the future of AI-powered conversations.
        </p>
      </div>

      <div className="space-y-4">
        {openings.map((job, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground">{job.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.dept}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{job.type}</Badge>
                <Button size="sm" variant="outline">Apply</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Don't see your role? Send your resume to{" "}
          <a href="mailto:careers@paisoltechnology.com" className="text-primary hover:underline">careers@paisoltechnology.com</a>
        </p>
      </div>
    </div>
  </PublicPageLayout>
);

export default CareersPage;
