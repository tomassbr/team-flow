import type { Company } from "@/types/domain";

export function updateCompany(fields: { name?: string; primaryColor?: string }): Promise<Company> {
  return fetch("/api/company", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Update failed");
    return data as Company;
  });
}
