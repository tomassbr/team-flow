import { tokens } from "@/styles/tokens.config";

export default function DashboardLoading() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.s40,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.s24,
        }}
      >
        <div
          style={{
            width: 200,
            height: 24,
            background: tokens.color.surface.level2,
            borderRadius: tokens.radius.r12,
          }}
        />
        <div
          style={{
            display: "flex",
            gap: tokens.space.s24,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: 56,
                height: 56,
                borderRadius: tokens.radius.full,
                background: tokens.color.surface.level2,
              }}
            />
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.s24,
        }}
      >
        <div
          style={{
            width: 120,
            height: 24,
            background: tokens.color.border.subtle,
            borderRadius: tokens.radius.r12,
          }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: tokens.space.s24,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                height: 140,
                background: tokens.color.surface.level2,
                borderRadius: tokens.radius.r20,
                boxShadow: tokens.shadow.e1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
