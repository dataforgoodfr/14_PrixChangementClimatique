"use client";

import * as React from "react";

import { Example, ExampleWrapper } from "@/components/example";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusIcon,
  BluetoothIcon,
  MoreVerticalIcon,
  FileIcon,
  FolderIcon,
  FolderOpenIcon,
  FileCodeIcon,
  MoreHorizontalIcon,
  FolderSearchIcon,
  SaveIcon,
  DownloadIcon,
  EyeIcon,
  LayoutIcon,
  PaletteIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  UserIcon,
  CreditCardIcon,
  SettingsIcon,
  KeyboardIcon,
  LanguagesIcon,
  BellIcon,
  MailIcon,
  ShieldIcon,
  HelpCircleIcon,
  FileTextIcon,
  LogOutIcon,
} from "lucide-react";
import { FranceMap } from "@/components/france-map";
import {
  RFCommuneSearchBox,
  SearchCommuneResult,
} from "@/components/core/rf-commune-searchbox";
import { useState } from "react";
import { RfVulnerabilityIndex } from "@/components/core/rf-vulnerability-index";
import { KpiStatCard } from "@/components/core/rf-kpi-stat-card";
import { KPISelector } from "@/components/core/rf-kpi-selector";
import { Legend } from "@/components/core/rf-legend";
import { MapProvider, type KpiField } from "@/contexts/map-context";
import {
  IndiceVulnerabiliteNiveauIcon,
  ScoreGeorisqueIcon,
  IndiceVulnerabiliteIcon,
  ScoreEconomiqueIcon,
  ScoreAssuranceIcon,
  type IconComponent,
} from "@/components/icons";
import { RfRecognitionRequestChart } from "@/components/core/rf-recognition-request-chart";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/core/stat-card";

export function ComponentExample() {
  return (
    <ExampleWrapper>
      <CardExample />
      <FormExample />
      <StatCardExample />
      <MapExample />
      <CommuneSearchBoxExample />
      <VulnerabilityIndexExample />
      <KpiStatCardExample />
      <KPISelectorExample />
      <LegendExample />
      <RecognitionRequestExample />
    </ExampleWrapper>
  );
}

function CardExample() {
  return (
    <Example title="Card" className="items-center justify-center">
      <Card className="relative w-full max-w-sm overflow-hidden pt-0">
        <div className="bg-primary absolute inset-0 z-30 aspect-video opacity-50 mix-blend-color" />
        <img
          src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Photo by mymind on Unsplash"
          title="Photo by mymind on Unsplash"
          className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"
        />
        <CardHeader>
          <CardTitle>Observability Plus is replacing Monitoring</CardTitle>
          <CardDescription>
            Switch to the improved way to explore your data, with natural
            language. Monitoring will no longer be available on the Pro plan in
            November, 2025
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>
                <PlusIcon data-icon="inline-start" />
                Show Dialog
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia>
                  <BluetoothIcon />
                </AlertDialogMedia>
                <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
                <AlertDialogDescription>
                  Do you want to allow the USB accessory to connect to this
                  device?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                <AlertDialogAction>Allow</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Badge variant="secondary" className="ml-auto">
            Warning
          </Badge>
        </CardFooter>
      </Card>
    </Example>
  );
}

const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const;

function FormExample() {
  const [notifications, setNotifications] = React.useState({
    email: true,
    sms: false,
    push: true,
  });
  const [theme, setTheme] = React.useState("light");

  return (
    <Example title="Form">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Please fill in your details below</CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVerticalIcon />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>File</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <FileIcon />
                    New File
                    <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FolderIcon />
                    New Folder
                    <DropdownMenuShortcut>⇧⌘N</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <FolderOpenIcon />
                      Open Recent
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Recent Projects</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <FileCodeIcon />
                            Project Alpha
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileCodeIcon />
                            Project Beta
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <MoreHorizontalIcon />
                              More Projects
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem>
                                  <FileCodeIcon />
                                  Project Gamma
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileCodeIcon />
                                  Project Delta
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <FolderSearchIcon />
                            Browse...
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <SaveIcon />
                    Save
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <DownloadIcon />
                    Export
                    <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>View</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: checked === true,
                      })
                    }
                  >
                    <EyeIcon />
                    Show Sidebar
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        sms: checked === true,
                      })
                    }
                  >
                    <LayoutIcon />
                    Show Status Bar
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <PaletteIcon />
                      Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                          <DropdownMenuRadioGroup
                            value={theme}
                            onValueChange={setTheme}
                          >
                            <DropdownMenuRadioItem value="light">
                              <SunIcon />
                              Light
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                              <MoonIcon />
                              Dark
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                              <MonitorIcon />
                              System
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <UserIcon />
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCardIcon />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <SettingsIcon />
                      Settings
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <KeyboardIcon />
                            Keyboard Shortcuts
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LanguagesIcon />
                            Language
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <BellIcon />
                              Notifications
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel>
                                    Notification Types
                                  </DropdownMenuLabel>
                                  <DropdownMenuCheckboxItem
                                    checked={notifications.push}
                                    onCheckedChange={(checked) =>
                                      setNotifications({
                                        ...notifications,
                                        push: checked === true,
                                      })
                                    }
                                  >
                                    <BellIcon />
                                    Push Notifications
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem
                                    checked={notifications.email}
                                    onCheckedChange={(checked) =>
                                      setNotifications({
                                        ...notifications,
                                        email: checked === true,
                                      })
                                    }
                                  >
                                    <MailIcon />
                                    Email Notifications
                                  </DropdownMenuCheckboxItem>
                                </DropdownMenuGroup>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <ShieldIcon />
                            Privacy & Security
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <HelpCircleIcon />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileTextIcon />
                    Documentation
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">
                    <LogOutIcon />
                    Sign Out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="small-form-name">Name</FieldLabel>
                  <Input
                    id="small-form-name"
                    placeholder="Enter your name"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="small-form-role">Role</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="small-form-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="small-form-framework">
                  Framework
                </FieldLabel>
                <Combobox items={frameworks}>
                  <ComboboxInput
                    id="small-form-framework"
                    placeholder="Select a framework"
                    required
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
              <Field>
                <FieldLabel htmlFor="small-form-comments">Comments</FieldLabel>
                <Textarea
                  id="small-form-comments"
                  placeholder="Add any additional comments"
                />
              </Field>
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </Example>
  );
}

function MapExample() {
  return (
    <Example
      title="Map of France"
      className="items-center justify-center"
      containerClassName="md:col-span-2"
    >
      <FranceMap />
    </Example>
  );
}

function CommuneSearchBoxExample() {
  const [selectedCommune, setSelectedCommune] = useState<SearchCommuneResult>();
  return (
    <Example
      title="Recherche d'une commune"
      className="items-center justify-center gap-4"
    >
      <RFCommuneSearchBox onAddressFilter={setSelectedCommune} />
      <div>
        Commune sélectionnée :{" "}
        {selectedCommune ? (
          <span>
            {selectedCommune.nom} - {selectedCommune.code}
          </span>
        ) : (
          "Aucune"
        )}
      </div>
    </Example>
  );
}

function StatCardExample() {
  return (
    <Example
      title="Cartes de statistiques"
      className="items-center justify-center gap-4"
      containerClassName="md:col-span-2"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard
          title="Budget / habitant"
          currentValue={2637}
          previousValue={2690}
          unit="€"
          comparisonText="vs. 2024"
        />
        <StatCard
          title="Taux d'endettement"
          currentValue={971}
          previousValue={952}
          unit="M€"
          comparisonText="vs. 2024"
        />
        <StatCard
          title="Taux de résidence secondaire"
          currentValue={2.6}
          previousValue={2.55}
          unit="%"
          comparisonText="vs. 2024"
        />
      </div>
    </Example>
  );
}

function VulnerabilityIndexExample() {
  return (
    <Example
      title="Indice de vulnérabilité"
      className="items-center justify-center gap-4"
    >
      <div className="w-70">
        <RfVulnerabilityIndex value={2.5} />
      </div>
    </Example>
  );
}

function KpiStatCardExample() {
  return (
    <Example title="KpiStatCard" className="gap-4">
      <div className="grid grid-cols-2 gap-2 w-full">
        <KpiStatCard label="Communes" value="2 252" total="36 529" />
        <KpiStatCard label="Habitants concernés" value="161 343" total="70M" />
      </div>
    </Example>
  );
}

const KPI_DEMO_OPTIONS: { value: KpiField; label: string; Icon: IconComponent }[] = [
  { value: "indice_vulnerabilite_niveau", label: "Vulnérabilité", Icon: IndiceVulnerabiliteNiveauIcon },
  { value: "score_georisque", label: "Exposition", Icon: ScoreGeorisqueIcon },
  { value: "indice_vulnerabilite", label: "Prévention", Icon: IndiceVulnerabiliteIcon },
  { value: "score_economique", label: "Situation économique", Icon: ScoreEconomiqueIcon },
  { value: "score_assurance", label: "Assurance", Icon: ScoreAssuranceIcon },
];

function KPISelectorExample() {
  const [activeKpi, setActiveKpi] = useState<KpiField>("indice_vulnerabilite_niveau");
  return (
    <Example title="KPISelector">
      <div className="grid grid-cols-5 gap-2 w-full">
        {KPI_DEMO_OPTIONS.map(({ value, label, Icon }) => (
          <KPISelector
            key={value}
            label={label}
            icon={Icon}
            active={activeKpi === value}
            onClick={() => setActiveKpi(value)}
          />
        ))}
      </div>
    </Example>
  );
}

function LegendExample() {
  return (
    <Example title="Legend" className="items-center justify-center gap-4">
      <MapProvider>
        <Legend />
      </MapProvider>
    </Example>
  );
}

function RecognitionRequestExample() {
  return (
    <Example
      title="Reconnaissance de catastrophe naturelle"
      className="items-center justify-center gap-4"
      containerClassName="md:col-span-2"
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            Demandes de reconnaissances de catastrophes naturelles
          </CardTitle>
          <span className="italic text-muted-foreground">
            Reconnues par la commission interministérielle - Depuis 1982
          </span>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-1/2">
            <RfRecognitionRequestChart recognized={53} unrecognized={8} />
          </div>
          <Separator orientation="vertical" className="hidden md:block" />
          <div className="w-full md:w-1/2 text-muted-foreground">
            Due to the average rating of general equipment&#39;s end-markets,
            such as safety equipment. 3M Co&#39;s forward-looking performance
            has a neutral impact on its overall rating. Due to the average
            rating of general equipment&#39;s end-markets, such as safety
            equipment.
          </div>
        </CardContent>
      </Card>
    </Example>
  );
}
