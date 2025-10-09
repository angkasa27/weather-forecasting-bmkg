export const defaultRegionCode = "36.71.01.1003";

export type RegionLevel = "province" | "regency" | "district" | "village";

export interface RegionNode {
  code: string;
  name: string;
  level: RegionLevel;
}

export interface Province extends RegionNode {
  level: "province";
  regencies: Regency[];
}

export interface Regency extends RegionNode {
  level: "regency";
  parentProvinceCode: string;
  districts: District[];
}

export interface District extends RegionNode {
  level: "district";
  parentProvinceCode: string;
  parentRegencyCode: string;
  villages: Village[];
}

export interface Village extends RegionNode {
  level: "village";
  parentProvinceCode: string;
  parentRegencyCode: string;
  parentDistrictCode: string;
}

export interface RegionHierarchy {
  provinces: Province[];
  provinceMap: Map<string, Province>;
  regencyMap: Map<string, Regency>;
  districtMap: Map<string, District>;
  villageMap: Map<string, Village>;
}

const parseLine = (line: string): { code: string; name: string } | null => {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const firstCommaIndex = trimmed.indexOf(",");
  if (firstCommaIndex === -1) {
    return null;
  }

  const code = trimmed.slice(0, firstCommaIndex).trim();
  const name = trimmed.slice(firstCommaIndex + 1).trim();

  if (!code || !name) {
    return null;
  }

  return { code, name };
};

const ensureProvince = (
  hierarchy: RegionHierarchy,
  code: string,
  name: string
): Province => {
  let province = hierarchy.provinceMap.get(code);
  if (!province) {
    province = {
      code,
      name,
      level: "province",
      regencies: [],
    };
    hierarchy.provinceMap.set(code, province);
    hierarchy.provinces.push(province);
  } else if (!province.name) {
    province.name = name;
  }
  return province;
};

const ensureRegency = (
  hierarchy: RegionHierarchy,
  code: string,
  name: string,
  provinceCode: string
): Regency => {
  let regency = hierarchy.regencyMap.get(code);
  if (!regency) {
    regency = {
      code,
      name,
      level: "regency",
      parentProvinceCode: provinceCode,
      districts: [],
    };
    hierarchy.regencyMap.set(code, regency);
    const province = ensureProvince(hierarchy, provinceCode, "");
    province.regencies.push(regency);
  } else if (!regency.name) {
    regency.name = name;
  }
  return regency;
};

const ensureDistrict = (
  hierarchy: RegionHierarchy,
  code: string,
  name: string,
  provinceCode: string,
  regencyCode: string
): District => {
  let district = hierarchy.districtMap.get(code);
  if (!district) {
    district = {
      code,
      name,
      level: "district",
      parentProvinceCode: provinceCode,
      parentRegencyCode: regencyCode,
      villages: [],
    };
    hierarchy.districtMap.set(code, district);
    const regency = ensureRegency(hierarchy, regencyCode, "", provinceCode);
    regency.districts.push(district);
  } else if (!district.name) {
    district.name = name;
  }
  return district;
};

const addVillage = (
  hierarchy: RegionHierarchy,
  code: string,
  name: string,
  provinceCode: string,
  regencyCode: string,
  districtCode: string
) => {
  if (hierarchy.villageMap.has(code)) {
    return;
  }

  const village: Village = {
    code,
    name,
    level: "village",
    parentProvinceCode: provinceCode,
    parentRegencyCode: regencyCode,
    parentDistrictCode: districtCode,
  };

  hierarchy.villageMap.set(code, village);
  const district = ensureDistrict(
    hierarchy,
    districtCode,
    "",
    provinceCode,
    regencyCode
  );
  district.villages.push(village);
};

export const buildHierarchyFromCsv = (csv: string): RegionHierarchy => {
  const hierarchy: RegionHierarchy = {
    provinces: [],
    provinceMap: new Map(),
    regencyMap: new Map(),
    districtMap: new Map(),
    villageMap: new Map(),
  };

  const lines = csv.split(/\r?\n/);
  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) {
      continue;
    }

    const { code, name } = parsed;
    const segments = code.split(".");

    switch (segments.length) {
      case 1: {
        ensureProvince(hierarchy, code, name);
        break;
      }
      case 2: {
        const provinceCode = segments[0];
        ensureRegency(hierarchy, code, name, provinceCode);
        break;
      }
      case 3: {
        const provinceCode = segments[0];
        const regencyCode = `${segments[0]}.${segments[1]}`;
        ensureDistrict(hierarchy, code, name, provinceCode, regencyCode);
        break;
      }
      case 4: {
        const provinceCode = segments[0];
        const regencyCode = `${segments[0]}.${segments[1]}`;
        const districtCode = `${segments[0]}.${segments[1]}.${segments[2]}`;
        addVillage(
          hierarchy,
          code,
          name,
          provinceCode,
          regencyCode,
          districtCode
        );
        break;
      }
      default:
        break;
    }
  }

  // Sort for stable display order
  const byName = <T extends RegionNode>(array: T[]) =>
    array.sort((a, b) => a.name.localeCompare(b.name));

  byName(hierarchy.provinces);
  for (const province of hierarchy.provinces) {
    byName(province.regencies);
    for (const regency of province.regencies) {
      byName(regency.districts);
      for (const district of regency.districts) {
        byName(district.villages);
      }
    }
  }

  return hierarchy;
};

export const getRegionPath = (
  hierarchy: RegionHierarchy,
  villageCode: string
): {
  province?: Province;
  regency?: Regency;
  district?: District;
  village?: Village;
} => {
  const village = hierarchy.villageMap.get(villageCode);
  if (!village) {
    return {};
  }

  const district = hierarchy.districtMap.get(village.parentDistrictCode);
  const regency = hierarchy.regencyMap.get(village.parentRegencyCode);
  const province = hierarchy.provinceMap.get(village.parentProvinceCode);

  return { village, district, regency, province };
};

export const getRegionDescription = (
  hierarchy: RegionHierarchy,
  villageCode: string
): string => {
  const { village, district, regency, province } = getRegionPath(
    hierarchy,
    villageCode
  );
  if (!village) {
    return `Kode ${villageCode}`;
  }

  const parts = [village.name];
  if (district) parts.push(district.name);
  if (regency) parts.push(regency.name);
  if (province) parts.push(province.name);

  return parts.join(", ");
};

export const splitRegionCode = (code: string) => {
  const segments = code.split(".");
  return {
    provinceCode: segments[0] || "",
    regencyCode: segments.length >= 2 ? `${segments[0]}.${segments[1]}` : "",
    districtCode:
      segments.length >= 3
        ? `${segments[0]}.${segments[1]}.${segments[2]}`
        : "",
    villageCode: segments.length >= 4 ? code : "",
  };
};
