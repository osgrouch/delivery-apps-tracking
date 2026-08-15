/**
 * Hand-written mirror of schema.sql, in the shape the Supabase CLI's
 * `supabase gen types typescript` would produce. Once the project is
 * linked, regenerate with:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.types.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      apps: {
        Row: {
          id: number;
          name: string;
          color: string;
          user_id: string;
        };
        Insert: {
          id?: number;
          name: string;
          color?: string;
          user_id?: string;
        };
        Update: {
          id?: number;
          name?: string;
          color?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      locations: {
        Row: {
          id: number;
          name: string;
          user_id: string;
        };
        Insert: {
          id?: number;
          name: string;
          user_id?: string;
        };
        Update: {
          id?: number;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      shifts: {
        Row: {
          id: string;
          app_id: number;
          location_id: number | null;
          date: string;
          start_time: string;
          end_time: string;
          earnings: number;
          mileage: number;
          trips: number;
          hours: number;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          app_id: number;
          location_id?: number | null;
          date: string;
          start_time: string;
          end_time: string;
          earnings: number;
          mileage: number;
          trips: number;
          hours: number;
          created_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          app_id?: number;
          location_id?: number | null;
          date?: string;
          start_time?: string;
          end_time?: string;
          earnings?: number;
          mileage?: number;
          trips?: number;
          hours?: number;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shifts_app_id_fkey";
            columns: ["app_id"];
            isOneToOne: false;
            referencedRelation: "apps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shifts_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type App = Database["public"]["Tables"]["apps"]["Row"];
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type Shift = Database["public"]["Tables"]["shifts"]["Row"];
export type ShiftInsert = Database["public"]["Tables"]["shifts"]["Insert"];
export type ShiftUpdate = Database["public"]["Tables"]["shifts"]["Update"];

/** A shift joined with its app and location, as returned by dashboard queries. */
export type ShiftWithApp = Shift & {
  app: Pick<App, "id" | "name">;
  location: Pick<Location, "id" | "name"> | null;
};
