export interface RegionConfig {
  label: string
  timezone: string
  newsCountry: string
  regionalHashtags: string[]
}

export const regionMap: Record<string, RegionConfig> = {
  AU: {
    label: 'Australia',
    timezone: 'Australia/Sydney',
    newsCountry: 'au',
    regionalHashtags: ['#AusBiz', '#AustralianStartups', '#AusTech'],
  },
  US: {
    label: 'United States',
    timezone: 'America/New_York',
    newsCountry: 'us',
    regionalHashtags: ['#USStartups', '#AmericanBusiness', '#USTech'],
  },
  IN: {
    label: 'India',
    timezone: 'Asia/Kolkata',
    newsCountry: 'in',
    regionalHashtags: ['#IndiaStartups', '#IndianBusiness', '#MakeInIndia'],
  },
  GB: {
    label: 'United Kingdom',
    timezone: 'Europe/London',
    newsCountry: 'gb',
    regionalHashtags: ['#UKBusiness', '#BritishStartups', '#UKTech'],
  },
  SG: {
    label: 'Singapore',
    timezone: 'Asia/Singapore',
    newsCountry: 'sg',
    regionalHashtags: ['#SGTech', '#SingaporeStartups', '#SGBusiness'],
  },
  CA: {
    label: 'Canada',
    timezone: 'America/Toronto',
    newsCountry: 'ca',
    regionalHashtags: ['#CanadaTech', '#CanadianBusiness', '#StartupCA'],
  },
  NZ: {
    label: 'New Zealand',
    timezone: 'Pacific/Auckland',
    newsCountry: 'nz',
    regionalHashtags: ['#NZBusiness', '#NZTech', '#NewZealandStartups'],
  },
  AE: {
    label: 'UAE',
    timezone: 'Asia/Dubai',
    newsCountry: 'ae',
    regionalHashtags: ['#DubaiBusiness', '#UAEStartups', '#MiddleEastTech'],
  },
}

export const getRegionConfig = (code: string): RegionConfig => {
  return regionMap[code] ?? regionMap['AU']
}
