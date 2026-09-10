/**
 * Complete Authentic Kanz-ul-Iman Audio Dataset
 * Source: Internet Archive (kanzuliman_201907) - Complete Audio QURAN (Kanzul Iman)
 * Creator: Ala Hazrat Imam Ahmad Raza Khan (Paigham-e-Raza)
 * Description: Tilawat of the Holy Quran with Authentic Kanz-ul-Iman Urdu Translation
 * Total: 114 Surahs (142 MP3 Tracks covering full Surahs with multi-part support)
 */

export interface KanzulImanAudioTrack {
  fileName: string;
  title: string;
  duration: number; // in seconds
  sizeBytes: number;
  url: string;
}

export const KANZUL_IMAN_ARCHIVE_IDENTIFIER = 'kanzuliman_201907';
export const KANZUL_IMAN_BASE_URL = 'https://archive.org/download/kanzuliman_201907/';

export const KANZUL_IMAN_AUDIO_MAP: Record<number, KanzulImanAudioTrack[]> = {
  "1": [
    {
      "fileName": "001. AL-FATIHA.mp3",
      "title": "AL-FATIHA",
      "duration": 83.72,
      "sizeBytes": 1339976,
      "url": "https://archive.org/download/kanzuliman_201907/001.%20AL-FATIHA.mp3"
    }
  ],
  "2": [
    {
      "fileName": "002. AL-BAQRA_1.mp3",
      "title": "AL-BAQRA 1",
      "duration": 4605,
      "sizeBytes": 36840175,
      "url": "https://archive.org/download/kanzuliman_201907/002.%20AL-BAQRA_1.mp3"
    },
    {
      "fileName": "002. AL-BAQRA_2.mp3",
      "title": "AL-BAQRA 2",
      "duration": 4645.67,
      "sizeBytes": 37165556,
      "url": "https://archive.org/download/kanzuliman_201907/002.%20AL-BAQRA_2.mp3"
    },
    {
      "fileName": "002. AL-BAQRA_3.mp3",
      "title": "AL-BAQRA 3",
      "duration": 3125,
      "sizeBytes": 25000227,
      "url": "https://archive.org/download/kanzuliman_201907/002.%20AL-BAQRA_3.mp3"
    }
  ],
  "3": [
    {
      "fileName": "003. AL-IMRAN_1.mp3",
      "title": "AL-IMRAN 1",
      "duration": 1497.02,
      "sizeBytes": 11976480,
      "url": "https://archive.org/download/kanzuliman_201907/003.%20AL-IMRAN_1.mp3"
    },
    {
      "fileName": "003. AL-IMRAN_2.mp3",
      "title": "AL-IMRAN 2",
      "duration": 4713.98,
      "sizeBytes": 37712160,
      "url": "https://archive.org/download/kanzuliman_201907/003.%20AL-IMRAN_2.mp3"
    },
    {
      "fileName": "003. AL-IMRAN_3.mp3",
      "title": "AL-IMRAN 3",
      "duration": 979.6,
      "sizeBytes": 7837056,
      "url": "https://archive.org/download/kanzuliman_201907/003.%20AL-IMRAN_3.mp3"
    }
  ],
  "4": [
    {
      "fileName": "004. AN-NISA_1.mp3",
      "title": "AN-NISA 1",
      "duration": 3704.4,
      "sizeBytes": 29635394,
      "url": "https://archive.org/download/kanzuliman_201907/004.%20AN-NISA_1.mp3"
    },
    {
      "fileName": "004. AN-NISA_2.mp3",
      "title": "AN-NISA 2",
      "duration": 4047.96,
      "sizeBytes": 32383894,
      "url": "https://archive.org/download/kanzuliman_201907/004.%20AN-NISA_2.mp3"
    }
  ],
  "5": [
    {
      "fileName": "005. AL-MAAIDA_1.mp3",
      "title": "AL-MAAIDA 1",
      "duration": 563.49,
      "sizeBytes": 4508106,
      "url": "https://archive.org/download/kanzuliman_201907/005.%20AL-MAAIDA_1.mp3"
    },
    {
      "fileName": "005. AL-MAAIDA_2.mp3",
      "title": "AL-MAAIDA 2",
      "duration": 4637.52,
      "sizeBytes": 37100354,
      "url": "https://archive.org/download/kanzuliman_201907/005.%20AL-MAAIDA_2.mp3"
    },
    {
      "fileName": "005. AL-MAAIDA_3.mp3",
      "title": "AL-MAAIDA 3",
      "duration": 561.45,
      "sizeBytes": 4491806,
      "url": "https://archive.org/download/kanzuliman_201907/005.%20AL-MAAIDA_3.mp3"
    }
  ],
  "6": [
    {
      "fileName": "006. Al-INAAM_1.mp3",
      "title": "Al-INAAM 1",
      "duration": 4143.52,
      "sizeBytes": 33148341,
      "url": "https://archive.org/download/kanzuliman_201907/006.%20Al-INAAM_1.mp3"
    },
    {
      "fileName": "006. Al-INAAM_2.mp3",
      "title": "Al-INAAM 2",
      "duration": 1681.61,
      "sizeBytes": 13453060,
      "url": "https://archive.org/download/kanzuliman_201907/006.%20Al-INAAM_2.mp3"
    }
  ],
  "7": [
    {
      "fileName": "007. AL-ERAAF_1.mp3",
      "title": "AL-ERAAF 1",
      "duration": 2984.72,
      "sizeBytes": 23878007,
      "url": "https://archive.org/download/kanzuliman_201907/007.%20AL-ERAAF_1.mp3"
    },
    {
      "fileName": "007. AL-ERAAF_2.mp3",
      "title": "AL-ERAAF 2",
      "duration": 3846.71,
      "sizeBytes": 30773915,
      "url": "https://archive.org/download/kanzuliman_201907/007.%20AL-ERAAF_2.mp3"
    }
  ],
  "8": [
    {
      "fileName": "008. AL-INFAAL_1.mp3",
      "title": "AL-INFAAL 1",
      "duration": 852.17,
      "sizeBytes": 6817540,
      "url": "https://archive.org/download/kanzuliman_201907/008.%20AL-INFAAL_1.mp3"
    },
    {
      "fileName": "008. AL-INFAAL_2.mp3",
      "title": "AL-INFAAL 2",
      "duration": 1880.84,
      "sizeBytes": 15046947,
      "url": "https://archive.org/download/kanzuliman_201907/008.%20AL-INFAAL_2.mp3"
    }
  ],
  "9": [
    {
      "fileName": "009. AT-TAUBA_1.mp3",
      "title": "AT-TAUBA 1",
      "duration": 793.21,
      "sizeBytes": 6345873,
      "url": "https://archive.org/download/kanzuliman_201907/009.%20AT-TAUBA_1.mp3"
    },
    {
      "fileName": "009. AT-TAUBA_2.mp3",
      "title": "AT-TAUBA 2",
      "duration": 2281.33,
      "sizeBytes": 18250813,
      "url": "https://archive.org/download/kanzuliman_201907/009.%20AT-TAUBA_2.mp3"
    }
  ],
  "10": [
    {
      "fileName": "010. YUNUS_1.mp3",
      "title": "YUNUS 1",
      "duration": 2356.56,
      "sizeBytes": 18852674,
      "url": "https://archive.org/download/kanzuliman_201907/010.%20YUNUS_1.mp3"
    },
    {
      "fileName": "010. YUNUS_2.mp3",
      "title": "YUNUS 2",
      "duration": 1203.85,
      "sizeBytes": 9631032,
      "url": "https://archive.org/download/kanzuliman_201907/010.%20YUNUS_2.mp3"
    }
  ],
  "11": [
    {
      "fileName": "011. HOOD_1.mp3",
      "title": "HOOD 1",
      "duration": 3436.56,
      "sizeBytes": 27492727,
      "url": "https://archive.org/download/kanzuliman_201907/011.%20HOOD_1.mp3"
    },
    {
      "fileName": "011. HOOD_2.mp3",
      "title": "HOOD 2",
      "duration": 462.58,
      "sizeBytes": 3700818,
      "url": "https://archive.org/download/kanzuliman_201907/011.%20HOOD_2.mp3"
    }
  ],
  "12": [
    {
      "fileName": "012. YUSUF.mp3",
      "title": "YUSUF",
      "duration": 3377.08,
      "sizeBytes": 27016880,
      "url": "https://archive.org/download/kanzuliman_201907/012.%20YUSUF.mp3"
    }
  ],
  "13": [
    {
      "fileName": "013. AR-RAAD_1.mp3",
      "title": "AR-RAAD 1",
      "duration": 791.17,
      "sizeBytes": 6329572,
      "url": "https://archive.org/download/kanzuliman_201907/013.%20AR-RAAD_1.mp3"
    },
    {
      "fileName": "013. AR-RAAD_2.mp3",
      "title": "AR-RAAD 2",
      "duration": 913.16,
      "sizeBytes": 7305507,
      "url": "https://archive.org/download/kanzuliman_201907/013.%20AR-RAAD_2.mp3"
    }
  ],
  "14": [
    {
      "fileName": "014. IBRAHIM.mp3",
      "title": "IBRAHIM",
      "duration": 1740.56,
      "sizeBytes": 13924727,
      "url": "https://archive.org/download/kanzuliman_201907/014.%20IBRAHIM.mp3"
    }
  ],
  "15": [
    {
      "fileName": "015. AL-HIJR.mp3",
      "title": "AL-HIJR",
      "duration": 1401.05,
      "sizeBytes": 11208619,
      "url": "https://archive.org/download/kanzuliman_201907/015.%20AL-HIJR.mp3"
    }
  ],
  "16": [
    {
      "fileName": "016. AN-NAHAL_1.mp3",
      "title": "AN-NAHAL 1",
      "duration": 602.1,
      "sizeBytes": 4816978,
      "url": "https://archive.org/download/kanzuliman_201907/016.%20AN-NAHAL_1.mp3"
    },
    {
      "fileName": "016. AN-NAHAL_2.mp3",
      "title": "AN-NAHAL 2",
      "duration": 3147.36,
      "sizeBytes": 25179114,
      "url": "https://archive.org/download/kanzuliman_201907/016.%20AN-NAHAL_2.mp3"
    }
  ],
  "17": [
    {
      "fileName": "017. AL-ISRAA_1.mp3",
      "title": "AL-ISRAA 1",
      "duration": 1533.2,
      "sizeBytes": 12265847,
      "url": "https://archive.org/download/kanzuliman_201907/017.%20AL-ISRAA_1.mp3"
    },
    {
      "fileName": "017. AL-ISRAA_2.mp3",
      "title": "AL-ISRAA 2",
      "duration": 608.21,
      "sizeBytes": 4865879,
      "url": "https://archive.org/download/kanzuliman_201907/017.%20AL-ISRAA_2.mp3"
    }
  ],
  "18": [
    {
      "fileName": "018. AL-KAHAF_1.mp3",
      "title": "AL-KAHAF 1",
      "duration": 2953.09,
      "sizeBytes": 23624932,
      "url": "https://archive.org/download/kanzuliman_201907/018.%20AL-KAHAF_1.mp3"
    },
    {
      "fileName": "018. AL-KAHAF_2.mp3",
      "title": "AL-KAHAF 2",
      "duration": 116.35,
      "sizeBytes": 931003,
      "url": "https://archive.org/download/kanzuliman_201907/018.%20AL-KAHAF_2.mp3"
    }
  ],
  "19": [
    {
      "fileName": "019. MARYAM.mp3",
      "title": "MARYAM",
      "duration": 1799.52,
      "sizeBytes": 14396394,
      "url": "https://archive.org/download/kanzuliman_201907/019.%20MARYAM.mp3"
    }
  ],
  "20": [
    {
      "fileName": "020. TA-HAA.mp3",
      "title": "TA-HAA",
      "duration": 2533.41,
      "sizeBytes": 20267466,
      "url": "https://archive.org/download/kanzuliman_201907/020.%20TA-HAA.mp3"
    }
  ],
  "21": [
    {
      "fileName": "021. AL-ANBIYA_1.mp3",
      "title": "AL-ANBIYA 1",
      "duration": 211.77,
      "sizeBytes": 1694405,
      "url": "https://archive.org/download/kanzuliman_201907/021.%20AL-ANBIYA_1.mp3"
    },
    {
      "fileName": "021. AL-ANBIYA_2.mp3",
      "title": "AL-ANBIYA 2",
      "duration": 2452.09,
      "sizeBytes": 19616913,
      "url": "https://archive.org/download/kanzuliman_201907/021.%20AL-ANBIYA_2.mp3"
    }
  ],
  "22": [
    {
      "fileName": "022. AL-HAJJ_1.mp3",
      "title": "AL-HAJJ 1",
      "duration": 2224.4,
      "sizeBytes": 17795447,
      "url": "https://archive.org/download/kanzuliman_201907/022.%20AL-HAJJ_1.mp3"
    },
    {
      "fileName": "022. AL-HAJJ_2.mp3",
      "title": "AL-HAJJ 2",
      "duration": 352.05,
      "sizeBytes": 2816625,
      "url": "https://archive.org/download/kanzuliman_201907/022.%20AL-HAJJ_2.mp3"
    }
  ],
  "23": [
    {
      "fileName": "023. AL-MU,MINOON.mp3",
      "title": "AL-MU,MINOON",
      "duration": 2169.52,
      "sizeBytes": 17356381,
      "url": "https://archive.org/download/kanzuliman_201907/023.%20AL-MU%2CMINOON.mp3"
    }
  ],
  "24": [
    {
      "fileName": "024. AN-NOOR_1.mp3",
      "title": "AN-NOOR 1",
      "duration": 2090.24,
      "sizeBytes": 16722128,
      "url": "https://archive.org/download/kanzuliman_201907/024.%20AN-NOOR_1.mp3"
    },
    {
      "fileName": "024. AN-NOOR_2.mp3",
      "title": "AN-NOOR 2",
      "duration": 459.81,
      "sizeBytes": 3678666,
      "url": "https://archive.org/download/kanzuliman_201907/024.%20AN-NOOR_2.mp3"
    }
  ],
  "25": [
    {
      "fileName": "025. AL-FURQAAN.mp3",
      "title": "AL-FURQAAN",
      "duration": 1746.65,
      "sizeBytes": 13973419,
      "url": "https://archive.org/download/kanzuliman_201907/025.%20AL-FURQAAN.mp3"
    }
  ],
  "26": [
    {
      "fileName": "026. ASH-SHARAA_1.mp3",
      "title": "ASH-SHARAA 1",
      "duration": 2470.4,
      "sizeBytes": 19763408,
      "url": "https://archive.org/download/kanzuliman_201907/026.%20ASH-SHARAA_1.mp3"
    },
    {
      "fileName": "026. ASH-SHARAA_2.mp3",
      "title": "ASH-SHARAA 2",
      "duration": 228.05,
      "sizeBytes": 1824599,
      "url": "https://archive.org/download/kanzuliman_201907/026.%20ASH-SHARAA_2.mp3"
    }
  ],
  "27": [
    {
      "fileName": "027. AN-NAMAL.mp3",
      "title": "AN-NAMAL",
      "duration": 2344.36,
      "sizeBytes": 18755081,
      "url": "https://archive.org/download/kanzuliman_201907/027.%20AN-NAMAL.mp3"
    }
  ],
  "28": [
    {
      "fileName": "028. AL-QASAS_1.mp3",
      "title": "AL-QASAS 1",
      "duration": 2084.13,
      "sizeBytes": 16673226,
      "url": "https://archive.org/download/kanzuliman_201907/028.%20AL-QASAS_1.mp3"
    },
    {
      "fileName": "028. AL-QASAS_2.mp3",
      "title": "AL-QASAS 2",
      "duration": 878.6,
      "sizeBytes": 7029027,
      "url": "https://archive.org/download/kanzuliman_201907/028.%20AL-QASAS_2.mp3"
    }
  ],
  "29": [
    {
      "fileName": "029. AL-ANKABUT.mp3",
      "title": "AL-ANKABUT",
      "duration": 2057.72,
      "sizeBytes": 16461948,
      "url": "https://archive.org/download/kanzuliman_201907/029.%20AL-ANKABUT.mp3"
    }
  ],
  "30": [
    {
      "fileName": "030. AR-ROOM.mp3",
      "title": "AR-ROOM",
      "duration": 1683.64,
      "sizeBytes": 13469360,
      "url": "https://archive.org/download/kanzuliman_201907/030.%20AR-ROOM.mp3"
    }
  ],
  "31": [
    {
      "fileName": "031. LUQMAN.mp3",
      "title": "LUQMAN",
      "duration": 1114.41,
      "sizeBytes": 8915486,
      "url": "https://archive.org/download/kanzuliman_201907/031.%20LUQMAN.mp3"
    }
  ],
  "32": [
    {
      "fileName": "032. AS-SAJDAH.mp3",
      "title": "AS-SAJDAH",
      "duration": 750.52,
      "sizeBytes": 6004400,
      "url": "https://archive.org/download/kanzuliman_201907/032.%20AS-SAJDAH.mp3"
    }
  ],
  "33": [
    {
      "fileName": "033. AL-EHZAAB.mp3",
      "title": "AL-EHZAAB",
      "duration": 2588.29,
      "sizeBytes": 20706532,
      "url": "https://archive.org/download/kanzuliman_201907/033.%20AL-EHZAAB.mp3"
    }
  ],
  "34": [
    {
      "fileName": "034. SABA_1.mp3",
      "title": "SABA 1",
      "duration": 150.8,
      "sizeBytes": 1206647,
      "url": "https://archive.org/download/kanzuliman_201907/034.%20SABA_1.mp3"
    },
    {
      "fileName": "034. SABA_2.mp3",
      "title": "SABA 2",
      "duration": 1584.04,
      "sizeBytes": 12672521,
      "url": "https://archive.org/download/kanzuliman_201907/034.%20SABA_2.mp3"
    }
  ],
  "35": [
    {
      "fileName": "035. FAATIR.mp3",
      "title": "FAATIR",
      "duration": 1541.33,
      "sizeBytes": 12330839,
      "url": "https://archive.org/download/kanzuliman_201907/035.%20FAATIR.mp3"
    }
  ],
  "36": [
    {
      "fileName": "036. YASIN.mp3",
      "title": "YASIN",
      "duration": 1547.44,
      "sizeBytes": 12379741,
      "url": "https://archive.org/download/kanzuliman_201907/036.%20YASIN.mp3"
    }
  ],
  "37": [
    {
      "fileName": "037. AS-SAFFAT.mp3",
      "title": "AS-SAFFAT",
      "duration": 1793.41,
      "sizeBytes": 14347492,
      "url": "https://archive.org/download/kanzuliman_201907/037.%20AS-SAFFAT.mp3"
    }
  ],
  "38": [
    {
      "fileName": "038. SWAAD.mp3",
      "title": "SWAAD",
      "duration": 1406.85,
      "sizeBytes": 11255012,
      "url": "https://archive.org/download/kanzuliman_201907/038.%20SWAAD.mp3"
    }
  ],
  "39": [
    {
      "fileName": "039. AZ-ZUMAR_1.mp3",
      "title": "AZ-ZUMAR 1",
      "duration": 1449.85,
      "sizeBytes": 11598993,
      "url": "https://archive.org/download/kanzuliman_201907/039.%20AZ-ZUMAR_1.mp3"
    },
    {
      "fileName": "039. AZ-ZUMAR_2.mp3",
      "title": "AZ-ZUMAR 2",
      "duration": 878.6,
      "sizeBytes": 7029027,
      "url": "https://archive.org/download/kanzuliman_201907/039.%20AZ-ZUMAR_2.mp3"
    }
  ],
  "40": [
    {
      "fileName": "040. GHAFIR.mp3",
      "title": "GHAFIR",
      "duration": 2464.29,
      "sizeBytes": 19714506,
      "url": "https://archive.org/download/kanzuliman_201907/040.%20GHAFIR.mp3"
    }
  ],
  "41": [
    {
      "fileName": "041. FUSSILAT_1.mp3",
      "title": "FUSSILAT 1",
      "duration": 1344.13,
      "sizeBytes": 10753252,
      "url": "https://archive.org/download/kanzuliman_201907/041.%20FUSSILAT_1.mp3"
    },
    {
      "fileName": "041. FUSSILAT_2.mp3",
      "title": "FUSSILAT 2",
      "duration": 341.89,
      "sizeBytes": 2735332,
      "url": "https://archive.org/download/kanzuliman_201907/041.%20FUSSILAT_2.mp3"
    }
  ],
  "42": [
    {
      "fileName": "042. ASH-SHAURA.mp3",
      "title": "ASH-SHAURA",
      "duration": 1649.08,
      "sizeBytes": 13192880,
      "url": "https://archive.org/download/kanzuliman_201907/042.%20ASH-SHAURA.mp3"
    }
  ],
  "43": [
    {
      "fileName": "043. ZUKHRUF.mp3",
      "title": "ZUKHRUF",
      "duration": 1746.65,
      "sizeBytes": 13973419,
      "url": "https://archive.org/download/kanzuliman_201907/043.%20ZUKHRUF.mp3"
    }
  ],
  "44": [
    {
      "fileName": "044. AD-DAKHAN.mp3",
      "title": "AD-DAKHAN",
      "duration": 718,
      "sizeBytes": 5744221,
      "url": "https://archive.org/download/kanzuliman_201907/044.%20AD-DAKHAN.mp3"
    }
  ],
  "45": [
    {
      "fileName": "045. AL-JASIYA.mp3",
      "title": "AL-JASIYA",
      "duration": 878.6,
      "sizeBytes": 7029027,
      "url": "https://archive.org/download/kanzuliman_201907/045.%20AL-JASIYA.mp3"
    }
  ],
  "46": [
    {
      "fileName": "046. AL-EHQAF.mp3",
      "title": "AL-EHQAF",
      "duration": 1252.65,
      "sizeBytes": 10021406,
      "url": "https://archive.org/download/kanzuliman_201907/046.%20AL-EHQAF.mp3"
    }
  ],
  "47": [
    {
      "fileName": "047. MOHAMMED.mp3",
      "title": "MOHAMMED",
      "duration": 1106.29,
      "sizeBytes": 8850493,
      "url": "https://archive.org/download/kanzuliman_201907/047.%20MOHAMMED.mp3"
    }
  ],
  "48": [
    {
      "fileName": "048. AL-FATEH.mp3",
      "title": "AL-FATEH",
      "duration": 1175.41,
      "sizeBytes": 9403453,
      "url": "https://archive.org/download/kanzuliman_201907/048.%20AL-FATEH.mp3"
    }
  ],
  "49": [
    {
      "fileName": "049. AL-HUJURAT_1.mp3",
      "title": "AL-HUJURAT 1",
      "duration": 469.97,
      "sizeBytes": 3759959,
      "url": "https://archive.org/download/kanzuliman_201907/049.%20AL-HUJURAT_1.mp3"
    },
    {
      "fileName": "049. AL-HUJURAT_2.mp3",
      "title": "AL-HUJURAT 2",
      "duration": 276.85,
      "sizeBytes": 2214973,
      "url": "https://archive.org/download/kanzuliman_201907/049.%20AL-HUJURAT_2.mp3"
    }
  ],
  "50": [
    {
      "fileName": "050. QAAF.mp3",
      "title": "QAAF",
      "duration": 740.36,
      "sizeBytes": 5923107,
      "url": "https://archive.org/download/kanzuliman_201907/050.%20QAAF.mp3"
    }
  ],
  "51": [
    {
      "fileName": "051. AZ-ZARIYAT.mp3",
      "title": "AZ-ZARIYAT",
      "duration": 762.72,
      "sizeBytes": 6101994,
      "url": "https://archive.org/download/kanzuliman_201907/051.%20AZ-ZARIYAT.mp3"
    }
  ],
  "52": [
    {
      "fileName": "052. AT-TOOR.mp3",
      "title": "AT-TOOR",
      "duration": 650.89,
      "sizeBytes": 5207352,
      "url": "https://archive.org/download/kanzuliman_201907/052.%20AT-TOOR.mp3"
    }
  ],
  "53": [
    {
      "fileName": "053. AN-NAJM.mp3",
      "title": "AN-NAJM",
      "duration": 703.76,
      "sizeBytes": 5630327,
      "url": "https://archive.org/download/kanzuliman_201907/053.%20AN-NAJM.mp3"
    }
  ],
  "54": [
    {
      "fileName": "054. AL-QAMAR.mp3",
      "title": "AL-QAMAR",
      "duration": 726.13,
      "sizeBytes": 5809213,
      "url": "https://archive.org/download/kanzuliman_201907/054.%20AL-QAMAR.mp3"
    }
  ],
  "55": [
    {
      "fileName": "055. AR-REHMAN_1.mp3",
      "title": "AR-REHMAN 1",
      "duration": 789.13,
      "sizeBytes": 6313272,
      "url": "https://archive.org/download/kanzuliman_201907/055.%20AR-REHMAN_1.mp3"
    },
    {
      "fileName": "055. AR-REHMAN_2.mp3",
      "title": "AR-REHMAN 2",
      "duration": 110.13,
      "sizeBytes": 881265,
      "url": "https://archive.org/download/kanzuliman_201907/055.%20AR-REHMAN_2.mp3"
    }
  ],
  "56": [
    {
      "fileName": "056. AL-WAQIAH.mp3",
      "title": "AL-WAQIAH",
      "duration": 831.84,
      "sizeBytes": 6654954,
      "url": "https://archive.org/download/kanzuliman_201907/056.%20AL-WAQIAH.mp3"
    }
  ],
  "57": [
    {
      "fileName": "057. AL-HADEED.mp3",
      "title": "AL-HADEED",
      "duration": 1140.85,
      "sizeBytes": 9126973,
      "url": "https://archive.org/download/kanzuliman_201907/057.%20AL-HADEED.mp3"
    }
  ],
  "58": [
    {
      "fileName": "058. AL-MUJADILAH.mp3",
      "title": "AL-MUJADILAH",
      "duration": 919.25,
      "sizeBytes": 7354199,
      "url": "https://archive.org/download/kanzuliman_201907/058.%20AL-MUJADILAH.mp3"
    }
  ],
  "59": [
    {
      "fileName": "059. AL-HASHR.mp3",
      "title": "AL-HASHR",
      "duration": 888.76,
      "sizeBytes": 7110320,
      "url": "https://archive.org/download/kanzuliman_201907/059.%20AL-HASHR.mp3"
    }
  ],
  "60": [
    {
      "fileName": "060. AL-MUMTAHINA.mp3",
      "title": "AL-MUMTAHINA",
      "duration": 713.93,
      "sizeBytes": 5711620,
      "url": "https://archive.org/download/kanzuliman_201907/060.%20AL-MUMTAHINA.mp3"
    }
  ],
  "61": [
    {
      "fileName": "061. AL-SAFF.mp3",
      "title": "AL-SAFF",
      "duration": 435.41,
      "sizeBytes": 3483479,
      "url": "https://archive.org/download/kanzuliman_201907/061.%20AL-SAFF.mp3"
    }
  ],
  "62": [
    {
      "fileName": "062. AL-JUMA.mp3",
      "title": "AL-JUMA",
      "duration": 352.05,
      "sizeBytes": 2816625,
      "url": "https://archive.org/download/kanzuliman_201907/062.%20AL-JUMA.mp3"
    }
  ],
  "63": [
    {
      "fileName": "063. AL-MUNAFIQUN.mp3",
      "title": "AL-MUNAFIQUN",
      "duration": 394.74,
      "sizeBytes": 3158098,
      "url": "https://archive.org/download/kanzuliman_201907/063.%20AL-MUNAFIQUN.mp3"
    }
  ],
  "64": [
    {
      "fileName": "064. AL-TAGHABUN.mp3",
      "title": "AL-TAGHABUN",
      "duration": 508.6,
      "sizeBytes": 4069040,
      "url": "https://archive.org/download/kanzuliman_201907/064.%20AL-TAGHABUN.mp3"
    }
  ],
  "65": [
    {
      "fileName": "065. AT-TALAQ.mp3",
      "title": "AT-TALAQ",
      "duration": 567.56,
      "sizeBytes": 4540707,
      "url": "https://archive.org/download/kanzuliman_201907/065.%20AT-TALAQ.mp3"
    }
  ],
  "66": [
    {
      "fileName": "066. AL-TEHRIM.mp3",
      "title": "AL-TEHRIM",
      "duration": 561.45,
      "sizeBytes": 4491806,
      "url": "https://archive.org/download/kanzuliman_201907/066.%20AL-TEHRIM.mp3"
    }
  ],
  "67": [
    {
      "fileName": "067. AL-MULK.mp3",
      "title": "AL-MULK",
      "duration": 657.01,
      "sizeBytes": 5256253,
      "url": "https://archive.org/download/kanzuliman_201907/067.%20AL-MULK.mp3"
    }
  ],
  "68": [
    {
      "fileName": "068. AL-QALAM.mp3",
      "title": "AL-QALAM",
      "duration": 642.77,
      "sizeBytes": 5142359,
      "url": "https://archive.org/download/kanzuliman_201907/068.%20AL-QALAM.mp3"
    }
  ],
  "69": [
    {
      "fileName": "069. AL-HAAQQAH.mp3",
      "title": "AL-HAAQQAH",
      "duration": 537.05,
      "sizeBytes": 4296619,
      "url": "https://archive.org/download/kanzuliman_201907/069.%20AL-HAAQQAH.mp3"
    }
  ],
  "70": [
    {
      "fileName": "070. AL-MAARIJ.mp3",
      "title": "AL-MAARIJ",
      "duration": 482.17,
      "sizeBytes": 3857553,
      "url": "https://archive.org/download/kanzuliman_201907/070.%20AL-MAARIJ.mp3"
    }
  ],
  "71": [
    {
      "fileName": "071. NOOH.mp3",
      "title": "NOOH",
      "duration": 459.81,
      "sizeBytes": 3678666,
      "url": "https://archive.org/download/kanzuliman_201907/071.%20NOOH.mp3"
    }
  ],
  "72": [
    {
      "fileName": "072. AL-JINN.mp3",
      "title": "AL-JINN",
      "duration": 522.81,
      "sizeBytes": 4182725,
      "url": "https://archive.org/download/kanzuliman_201907/072.%20AL-JINN.mp3"
    }
  ],
  "73": [
    {
      "fileName": "073. AL-MUZAMMIL.mp3",
      "title": "AL-MUZAMMIL",
      "duration": 406.94,
      "sizeBytes": 3255692,
      "url": "https://archive.org/download/kanzuliman_201907/073.%20AL-MUZAMMIL.mp3"
    }
  ],
  "74": [
    {
      "fileName": "074. AL-MUDASSIR.mp3",
      "title": "AL-MUDASSIR",
      "duration": 510.62,
      "sizeBytes": 4085132,
      "url": "https://archive.org/download/kanzuliman_201907/074.%20AL-MUDASSIR.mp3"
    }
  ],
  "75": [
    {
      "fileName": "075. AL-QIYAMAH.mp3",
      "title": "AL-QIYAMAH",
      "duration": 337.87,
      "sizeBytes": 2703150,
      "url": "https://archive.org/download/kanzuliman_201907/075.%20AL-QIYAMAH.mp3"
    }
  ],
  "76": [
    {
      "fileName": "076. AL-INSAN.mp3",
      "title": "AL-INSAN",
      "duration": 518.79,
      "sizeBytes": 4150542,
      "url": "https://archive.org/download/kanzuliman_201907/076.%20AL-INSAN.mp3"
    }
  ],
  "77": [
    {
      "fileName": "077. AL-MURSALAT.mp3",
      "title": "AL-MURSALAT",
      "duration": 411.04,
      "sizeBytes": 3288501,
      "url": "https://archive.org/download/kanzuliman_201907/077.%20AL-MURSALAT.mp3"
    }
  ],
  "78": [
    {
      "fileName": "078. AN-NABA.mp3",
      "title": "AN-NABA",
      "duration": 400.88,
      "sizeBytes": 3207208,
      "url": "https://archive.org/download/kanzuliman_201907/078.%20AN-NABA.mp3"
    }
  ],
  "79": [
    {
      "fileName": "079. AL-NAZAAT.mp3",
      "title": "AL-NAZAAT",
      "duration": 396.8,
      "sizeBytes": 3174608,
      "url": "https://archive.org/download/kanzuliman_201907/079.%20AL-NAZAAT.mp3"
    }
  ],
  "80": [
    {
      "fileName": "080. ABAS_1.mp3",
      "title": "ABAS 1",
      "duration": 169.12,
      "sizeBytes": 1353141,
      "url": "https://archive.org/download/kanzuliman_201907/080.%20ABAS_1.mp3"
    },
    {
      "fileName": "080. ABAS_2.mp3",
      "title": "ABAS 2",
      "duration": 132.52,
      "sizeBytes": 1060361,
      "url": "https://archive.org/download/kanzuliman_201907/080.%20ABAS_2.mp3"
    }
  ],
  "81": [
    {
      "fileName": "081. AL-TAKWEER.mp3",
      "title": "AL-TAKWEER",
      "duration": 217.91,
      "sizeBytes": 1743515,
      "url": "https://archive.org/download/kanzuliman_201907/081.%20AL-TAKWEER.mp3"
    }
  ],
  "82": [
    {
      "fileName": "082. AL-INFITAR.mp3",
      "title": "AL-INFITAR",
      "duration": 173.19,
      "sizeBytes": 1385742,
      "url": "https://archive.org/download/kanzuliman_201907/082.%20AL-INFITAR.mp3"
    }
  ],
  "83": [
    {
      "fileName": "083. AL-MUTFIFEEN.mp3",
      "title": "AL-MUTFIFEEN",
      "duration": 382.56,
      "sizeBytes": 3060714,
      "url": "https://archive.org/download/kanzuliman_201907/083.%20AL-MUTFIFEEN.mp3"
    }
  ],
  "84": [
    {
      "fileName": "084. AL-INSHIQAQ.mp3",
      "title": "AL-INSHIQAQ",
      "duration": 238.24,
      "sizeBytes": 1906101,
      "url": "https://archive.org/download/kanzuliman_201907/084.%20AL-INSHIQAQ.mp3"
    }
  ],
  "85": [
    {
      "fileName": "085. AL-BURUJ.mp3",
      "title": "AL-BURUJ",
      "duration": 232.15,
      "sizeBytes": 1857409,
      "url": "https://archive.org/download/kanzuliman_201907/085.%20AL-BURUJ.mp3"
    }
  ],
  "86": [
    {
      "fileName": "086. AL-TARIQ.mp3",
      "title": "AL-TARIQ",
      "duration": 144.72,
      "sizeBytes": 1157954,
      "url": "https://archive.org/download/kanzuliman_201907/086.%20AL-TARIQ.mp3"
    }
  ],
  "87": [
    {
      "fileName": "087. AL-AALA.mp3",
      "title": "AL-AALA",
      "duration": 158.96,
      "sizeBytes": 1271848,
      "url": "https://archive.org/download/kanzuliman_201907/087.%20AL-AALA.mp3"
    }
  ],
  "88": [
    {
      "fileName": "088. AL-GHASHIYAH.mp3",
      "title": "AL-GHASHIYAH",
      "duration": 203.68,
      "sizeBytes": 1629621,
      "url": "https://archive.org/download/kanzuliman_201907/088.%20AL-GHASHIYAH.mp3"
    }
  ],
  "89": [
    {
      "fileName": "089. AL-FAJR.mp3",
      "title": "AL-FAJR",
      "duration": 307.36,
      "sizeBytes": 2459061,
      "url": "https://archive.org/download/kanzuliman_201907/089.%20AL-FAJR.mp3"
    }
  ],
  "90": [
    {
      "fileName": "090. AL-BALAD.mp3",
      "title": "AL-BALAD",
      "duration": 181.32,
      "sizeBytes": 1450735,
      "url": "https://archive.org/download/kanzuliman_201907/090.%20AL-BALAD.mp3"
    }
  ],
  "91": [
    {
      "fileName": "091. ASH-SHAMS.mp3",
      "title": "ASH-SHAMS",
      "duration": 142.68,
      "sizeBytes": 1141654,
      "url": "https://archive.org/download/kanzuliman_201907/091.%20ASH-SHAMS.mp3"
    }
  ],
  "92": [
    {
      "fileName": "092. AL-LAIL.mp3",
      "title": "AL-LAIL",
      "duration": 175.2,
      "sizeBytes": 1401834,
      "url": "https://archive.org/download/kanzuliman_201907/092.%20AL-LAIL.mp3"
    }
  ],
  "93": [
    {
      "fileName": "093. AD-DUHA.mp3",
      "title": "AD-DUHA",
      "duration": 108.12,
      "sizeBytes": 865174,
      "url": "https://archive.org/download/kanzuliman_201907/093.%20AD-DUHA.mp3"
    }
  ],
  "94": [
    {
      "fileName": "094. ALAM NASHRAH.mp3",
      "title": "ALAM NASHRAH",
      "duration": 69.51,
      "sizeBytes": 556302,
      "url": "https://archive.org/download/kanzuliman_201907/094.%20ALAM%20NASHRAH.mp3"
    }
  ],
  "95": [
    {
      "fileName": "095. AT-TEEN.mp3",
      "title": "AT-TEEN",
      "duration": 87.8,
      "sizeBytes": 702588,
      "url": "https://archive.org/download/kanzuliman_201907/095.%20AT-TEEN.mp3"
    }
  ],
  "96": [
    {
      "fileName": "096. AL-ALAQ.mp3",
      "title": "AL-ALAQ",
      "duration": 160.99,
      "sizeBytes": 1288149,
      "url": "https://archive.org/download/kanzuliman_201907/096.%20AL-ALAQ.mp3"
    }
  ],
  "97": [
    {
      "fileName": "097. AL-QADR.mp3",
      "title": "AL-QADR",
      "duration": 65.44,
      "sizeBytes": 523701,
      "url": "https://archive.org/download/kanzuliman_201907/097.%20AL-QADR.mp3"
    }
  ],
  "98": [
    {
      "fileName": "098. AL-BAYYENA.mp3",
      "title": "AL-BAYYENA",
      "duration": 191.48,
      "sizeBytes": 1532028,
      "url": "https://archive.org/download/kanzuliman_201907/098.%20AL-BAYYENA.mp3"
    }
  ],
  "99": [
    {
      "fileName": "099. AZ-ZULZILAH.mp3",
      "title": "AZ-ZULZILAH",
      "duration": 89.84,
      "sizeBytes": 718888,
      "url": "https://archive.org/download/kanzuliman_201907/099.%20AZ-ZULZILAH.mp3"
    }
  ],
  "100": [
    {
      "fileName": "100. AL-AADIYAT.mp3",
      "title": "AL-AADIYAT",
      "duration": 102.03,
      "sizeBytes": 816482,
      "url": "https://archive.org/download/kanzuliman_201907/100.%20AL-AADIYAT.mp3"
    }
  ],
  "101": [
    {
      "fileName": "101. AL-QARIYAH.mp3",
      "title": "AL-QARIYAH",
      "duration": 93.86,
      "sizeBytes": 1502144,
      "url": "https://archive.org/download/kanzuliman_201907/101.%20AL-QARIYAH.mp3"
    }
  ],
  "102": [
    {
      "fileName": "102. AT-TAKASUR.mp3",
      "title": "AT-TAKASUR",
      "duration": 85.73,
      "sizeBytes": 1372159,
      "url": "https://archive.org/download/kanzuliman_201907/102.%20AT-TAKASUR.mp3"
    }
  ],
  "103": [
    {
      "fileName": "103. AL-ASR.mp3",
      "title": "AL-ASR",
      "duration": 47.1,
      "sizeBytes": 753997,
      "url": "https://archive.org/download/kanzuliman_201907/103.%20AL-ASR.mp3"
    }
  ],
  "104": [
    {
      "fileName": "104. AL-HUMAZA.mp3",
      "title": "AL-HUMAZA",
      "duration": 85.73,
      "sizeBytes": 1372159,
      "url": "https://archive.org/download/kanzuliman_201907/104.%20AL-HUMAZA.mp3"
    }
  ],
  "105": [
    {
      "fileName": "105. AL-FEEL.mp3",
      "title": "AL-FEEL",
      "duration": 67.45,
      "sizeBytes": 1079587,
      "url": "https://archive.org/download/kanzuliman_201907/105.%20AL-FEEL.mp3"
    }
  ],
  "106": [
    {
      "fileName": "106. QURAISH.mp3",
      "title": "QURAISH",
      "duration": 59.32,
      "sizeBytes": 949602,
      "url": "https://archive.org/download/kanzuliman_201907/106.%20QURAISH.mp3"
    }
  ],
  "107": [
    {
      "fileName": "107. AL-MAUON.mp3",
      "title": "AL-MAUON",
      "duration": 71.52,
      "sizeBytes": 1144789,
      "url": "https://archive.org/download/kanzuliman_201907/107.%20AL-MAUON.mp3"
    }
  ],
  "108": [
    {
      "fileName": "108. AL-KAUSAR.mp3",
      "title": "AL-KAUSAR",
      "duration": 43.05,
      "sizeBytes": 689213,
      "url": "https://archive.org/download/kanzuliman_201907/108.%20AL-KAUSAR.mp3"
    }
  ],
  "109": [
    {
      "fileName": "109. AL-KAFIRUN.mp3",
      "title": "AL-KAFIRUN",
      "duration": 67.45,
      "sizeBytes": 1079587,
      "url": "https://archive.org/download/kanzuliman_201907/109.%20AL-KAFIRUN.mp3"
    }
  ],
  "110": [
    {
      "fileName": "110. AN-NASR.mp3",
      "title": "AN-NASR",
      "duration": 57.29,
      "sizeBytes": 917001,
      "url": "https://archive.org/download/kanzuliman_201907/110.%20AN-NASR.mp3"
    }
  ],
  "111": [
    {
      "fileName": "111. LAHAB.mp3",
      "title": "LAHAB",
      "duration": 57.29,
      "sizeBytes": 917001,
      "url": "https://archive.org/download/kanzuliman_201907/111.%20LAHAB.mp3"
    }
  ],
  "112": [
    {
      "fileName": "112. AL-IKHLAS.mp3",
      "title": "AL-IKHLAS",
      "duration": 41.01,
      "sizeBytes": 656612,
      "url": "https://archive.org/download/kanzuliman_201907/112.%20AL-IKHLAS.mp3"
    }
  ],
  "113": [
    {
      "fileName": "113. AL-FALAQ.mp3",
      "title": "AL-FALAQ",
      "duration": 57.29,
      "sizeBytes": 917001,
      "url": "https://archive.org/download/kanzuliman_201907/113.%20AL-FALAQ.mp3"
    }
  ],
  "114": [
    {
      "fileName": "114. AN-NAAS.mp3",
      "title": "AN-NAAS",
      "duration": 130.46,
      "sizeBytes": 2087705,
      "url": "https://archive.org/download/kanzuliman_201907/114.%20AN-NAAS.mp3"
    }
  ]
};

/**
 * Returns all audio tracks (parts) for a given Surah number (1-114)
 */
export function getKanzulImanAudioTracks(surahNumber: number): KanzulImanAudioTrack[] {
  const clamped = Math.max(1, Math.min(114, surahNumber));
  return KANZUL_IMAN_AUDIO_MAP[clamped] || [];
}

/**
 * Returns the audio URL for a specific Surah and part index (0-based)
 */
export function getKanzulImanSurahAudioUrl(surahNumber: number, partIndex: number = 0): string {
  const tracks = getKanzulImanAudioTracks(surahNumber);
  if (tracks.length === 0) return '';
  const validIndex = Math.max(0, Math.min(tracks.length - 1, partIndex));
  return tracks[validIndex].url;
}

/**
 * Returns whether a Surah is divided into multiple audio parts
 */
export function isKanzulImanMultiPart(surahNumber: number): boolean {
  const tracks = getKanzulImanAudioTracks(surahNumber);
  return tracks.length > 1;
}

/**
 * Returns the total duration in seconds for a Surah across all its parts
 */
export function getKanzulImanSurahDuration(surahNumber: number): number {
  const tracks = getKanzulImanAudioTracks(surahNumber);
  return tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
}
