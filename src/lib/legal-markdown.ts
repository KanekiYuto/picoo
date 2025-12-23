// 辅助函数：生成 Privacy Markdown 内容
export function generatePrivacyMarkdown(t: any, params: { siteName: string; lastUpdated: string; email: string }) {
  const intro = t.raw('intro');
  const dataCollection = t.raw('dataCollection');
  const dataUsage = t.raw('dataUsage');
  const dataSharing = t.raw('dataSharing');
  const dataStorage = t.raw('dataStorage');
  const cookies = t.raw('cookies');
  const userRights = t.raw('userRights');
  const thirdParty = t.raw('thirdParty');
  const children = t.raw('children');
  const changes = t.raw('changes');
  const contact = t.raw('contact');

  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{siteName}/g, params.siteName)
      .replace(/{lastUpdated}/g, params.lastUpdated)
      .replace(/{email}/g, params.email);
  };

  return `# ${t('title')}

**${t('lastUpdated', { lastUpdated: params.lastUpdated })}**

---

## ${intro.title}

${replacePlaceholders(intro.p1)}

${replacePlaceholders(intro.p2)}

## 1. ${dataCollection.title}

${dataCollection.intro}

### 1.1 ${dataCollection.provided.title}

${dataCollection.provided.items.map((item: string) => `- ${item}`).join('\n')}

### 1.2 ${dataCollection.automatic.title}

${dataCollection.automatic.items.map((item: string) => `- ${item}`).join('\n')}

### 1.3 ${dataCollection.userContent.title}

${dataCollection.userContent.content}

## 2. ${dataUsage.title}

${dataUsage.intro}

${dataUsage.items.map((item: string) => `- ${item}`).join('\n')}

## 3. ${dataSharing.title}

${dataSharing.intro}

${dataSharing.items.map((item: string) => `- ${item}`).join('\n')}

## 4. ${dataStorage.title}

**4.1 ${dataStorage.location.title}**

${dataStorage.location.content}

**4.2 ${dataStorage.retention.title}**

${dataStorage.retention.content}

**4.3 ${dataStorage.security.title}**

${dataStorage.security.content}

## 5. ${cookies.title}

${cookies.intro}

${cookies.items.map((item: string) => `- ${item}`).join('\n')}

${cookies.note}

## 6. ${userRights.title}

${userRights.intro}

${userRights.items.map((item: string) => `- ${item}`).join('\n')}

## 7. ${thirdParty.title}

${thirdParty.content}

## 8. ${children.title}

${children.content}

## 9. ${changes.title}

${changes.content}

## 10. ${contact.title}

${contact.intro}

**${replacePlaceholders(contact.email)}**
`;
}

// 辅助函数：生成 Refund Markdown 内容
export function generateRefundMarkdown(t: any, params: { siteName: string; lastUpdated: string; email: string }) {
  const overview = t.raw('overview');
  const subscription = t.raw('subscription');
  const credits = t.raw('credits');
  const ineligible = t.raw('ineligible');
  const technical = t.raw('technical');
  const process = t.raw('process');
  const processing = t.raw('processing');
  const partial = t.raw('partial');
  const denial = t.raw('denial');
  const disputes = t.raw('disputes');
  const changes = t.raw('changes');
  const contact = t.raw('contact');

  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{siteName}/g, params.siteName)
      .replace(/{lastUpdated}/g, params.lastUpdated)
      .replace(/{email}/g, params.email);
  };

  return `# ${t('title')}

**${t('lastUpdated', { lastUpdated: params.lastUpdated })}**

---

## 1. ${overview.title}

${replacePlaceholders(overview.p1)}

${overview.p2}

## 2. ${subscription.title}

### 2.1 ${subscription.plans.title}

${subscription.plans.intro}

${subscription.plans.items.map((item: string) => `- ${item}`).join('\n')}

### 2.2 ${subscription.annual.title}

${subscription.annual.items.map((item: string) => `- ${item}`).join('\n')}

## 3. ${credits.title}

### 3.1 ${credits.packages.title}

${credits.packages.items.map((item: string) => `- ${item}`).join('\n')}

### 3.2 ${credits.features.title}

${credits.features.items.map((item: string) => `- ${item}`).join('\n')}

## 4. ${ineligible.title}

${ineligible.intro}

${ineligible.items.map((item: string) => `- ${item}`).join('\n')}

## 5. ${technical.title}

### 5.1 ${technical.quality.title}

${technical.quality.intro}

${technical.quality.items.map((item: string) => `- ${item}`).join('\n')}

### 5.2 ${technical.compensation.title}

${technical.compensation.intro}

${technical.compensation.items.map((item: string) => `- ${item}`).join('\n')}

## 6. ${process.title}

### 6.1 ${process.submit.title}

${process.submit.intro}

${process.submit.steps.map((step: string, i: number) => `${i + 1}. ${replacePlaceholders(step)}`).join('\n')}

${replacePlaceholders(process.submit.alternative)}

### 6.2 ${process.info.title}

${process.info.intro}

${process.info.items.map((item: string) => `- ${item}`).join('\n')}

### 6.3 ${process.review.title}

${process.review.items.map((item: string) => `- ${item}`).join('\n')}

## 7. ${processing.title}

### 7.1 ${processing.method.title}

${processing.method.items.map((item: string) => `- ${item}`).join('\n')}

### 7.2 ${processing.timing.title}

${processing.timing.items.map((item: string) => `- ${item}`).join('\n')}

### 7.3 ${processing.confirmation.title}

${processing.confirmation.content}

## 8. ${partial.title}

${partial.intro}

${partial.items.map((item: string) => `- ${item}`).join('\n')}

${replacePlaceholders(partial.note)}

## 9. ${denial.title}

${denial.intro}

${denial.items.map((item: string) => `- ${item}`).join('\n')}

${denial.note}

## 10. ${disputes.title}

### 10.1 ${disputes.internal.title}

${disputes.internal.intro}

${disputes.internal.steps.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

### 10.2 ${disputes.thirdParty.title}

${disputes.thirdParty.intro}

${disputes.thirdParty.items.map((item: string) => `- ${item}`).join('\n')}

## 11. ${changes.title}

${replacePlaceholders(changes.p1)}

${changes.p2}

## 12. ${contact.title}

${contact.intro}

**${replacePlaceholders(contact.email)}**

${contact.support}

---

${replacePlaceholders(contact.note)}
`;
}
