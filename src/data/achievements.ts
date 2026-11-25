export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  year: string;
  kind: "competition" | "certificate";
  link?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "lks-web-tech",
    title: "Juara 3 LKS Web Technology",
    issuer: "Lomba Kompetensi Siswa Tingkat Kabupaten (TODO: penyelenggara)",
    year: "TODO",
    kind: "competition",
  },
  {
    id: "cert-1",
    title: "TODO: Nama Sertifikat 1",
    issuer: "TODO: Penerbit Sertifikat 1",
    year: "TODO",
    kind: "certificate",
  },
  {
    id: "cert-2",
    title: "TODO: Nama Sertifikat 2",
    issuer: "TODO: Penerbit Sertifikat 2",
    year: "TODO",
    kind: "certificate",
  },
];

