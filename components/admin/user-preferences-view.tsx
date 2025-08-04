import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type JobPreferences = {
    job_titles: string[];
    industries: string[];
    locations: string[];
    work_arrangement: string | null;
    salary_range_min: number | null;
    salary_range_max: number | null;
    employment_types: string[];
    company_sizes: string[];
    target_companies: string[];
    avoid_companies: string[];
};

interface UserPreferencesViewProps {
  preferences: JobPreferences | null;
}

const DataField = ({ label, value }: { label: string; value: string | React.ReactNode }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;

    return (
        <div className="grid grid-cols-3 gap-4 py-2">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <div className="col-span-2 text-sm">
                {value}
            </div>
        </div>
    )
};

const TagList = ({ tags }: { tags: string[] }) => {
    if (!tags || tags.length === 0) return <span className="text-sm text-muted-foreground">Not specified</span>;
    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
    )
};


export function UserPreferencesView({ preferences }: UserPreferencesViewProps) {
  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This user has not saved any job preferences yet.</p>
        </CardContent>
      </Card>
    );
  }

  const formatSalary = (value: number | null) => {
    if (value === null) return 'N/A';
    return `R ${value.toLocaleString()}`;
  }
  
  const salaryDisplay = `${formatSalary(preferences.salary_range_min)} - ${formatSalary(preferences.salary_range_max)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <h3 className="text-lg font-semibold mb-2">Desired Roles & Industries</h3>
            <Separator />
            <DataField label="Job Titles" value={<TagList tags={preferences.job_titles} />} />
            <DataField label="Industries" value={<TagList tags={preferences.industries} />} />
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-2">Location & Work Style</h3>
            <Separator />
            <DataField label="Locations" value={<TagList tags={preferences.locations} />} />
            <DataField label="Work Arrangement" value={preferences.work_arrangement || 'Not specified'} />
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-2">Compensation & Contract</h3>
            <Separator />
            <DataField label="Desired Salary" value={salaryDisplay} />
            <DataField label="Employment Types" value={<TagList tags={preferences.employment_types} />} />
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-2">Advanced Filters</h3>
            <Separator />
            <DataField label="Company Sizes" value={<TagList tags={preferences.company_sizes} />} />
            <DataField label="Target Companies" value={<TagList tags={preferences.target_companies} />} />
            <DataField label="Avoid Companies" value={<TagList tags={preferences.avoid_companies} />} />
        </div>
      </CardContent>
    </Card>
  );
} 