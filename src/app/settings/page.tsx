"use client";

import { PageContainer, PageContent, PageHeaderWithTitle } from "@/components/ui/layout";
import { Muted } from "@/components/lib";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageContent>
        <PageHeaderWithTitle
          title="settings"
          subtitle="Manage your account and data preferences"
        />
        <Muted size="sm">no settings available yet</Muted>
      </PageContent>
    </PageContainer>
  );
}
