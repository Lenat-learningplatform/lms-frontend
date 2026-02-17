"use client";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { EventContentArg, DatesSetArg } from "@fullcalendar/core";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

// Default colors for known categories
const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  meeting: "data-[state=checked]:bg-warning data-[state=checked]:ring-warning",
  test: "data-[state=checked]:bg-destructive data-[state=checked]:ring-destructive",
  business: "data-[state=checked]:bg-primary data-[state=checked]:ring-primary",
  personal: "data-[state=checked]:bg-success data-[state=checked]:ring-success",
  holiday:
    "data-[state=checked]:bg-destructive data-[state=checked]:ring-destructive",
  family: "data-[state=checked]:bg-info data-[state=checked]:ring-info",
};

// Colors for unknown categories (rotating through these)
const UNKNOWN_CATEGORY_COLORS = [
  "data-[state=checked]:bg-purple-500 data-[state=checked]:ring-purple-500",
  "data-[state=checked]:bg-pink-500 data-[state=checked]:ring-pink-500",
  "data-[state=checked]:bg-indigo-500 data-[state=checked]:ring-indigo-500",
  "data-[state=checked]:bg-amber-500 data-[state=checked]:ring-amber-500",
  "data-[state=checked]:bg-emerald-500 data-[state=checked]:ring-emerald-500",
];

const CalendarView = () => {
  const [selectedCategory, setSelectedCategory] = useState<string[] | null>(
    null
  );
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });
  const [categories, setCategories] = useState<
    Array<{
      label: string;
      value: string;
      className: string;
    }>
  >([]);
  const t = useTranslations("CalendarApp");

  const { data: events } = useQuery({
    queryKey: ["calendar", dateRange],
    queryFn: async () => {
      const params = {
        start_date: dateRange.start.toISOString().split("T")[0],
        end_date: dateRange.end.toISOString().split("T")[0],
      };

      const response = await api.get(`get-calendars`, { params });
      return response.data.data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
    },
  });

  useEffect(() => {
    if (events) {
      // Extract unique categories from events
      const uniqueCategories = new Set<string>();
      events.forEach((event: any) => {
        if (event.extendedProps?.calendar) {
          uniqueCategories.add(event.extendedProps.calendar);
        }
      });

      // Create categories array with appropriate colors
      const categoryArray = Array.from(uniqueCategories).map(
        (category, index) => {
          const knownColor = DEFAULT_CATEGORY_COLORS[category];
          const unknownColor =
            UNKNOWN_CATEGORY_COLORS[index % UNKNOWN_CATEGORY_COLORS.length];

          return {
            label: category.charAt(0).toUpperCase() + category.slice(1),
            value: category,
            className: knownColor || unknownColor,
          };
        }
      );

      setCategories(categoryArray);
      setSelectedCategory(categoryArray.map((c) => c.value));
    }
  }, [events]);

  const handleDatesSet = (arg: DatesSetArg) => {
    setDateRange({
      start: arg.start,
      end: arg.end,
    });
  };

  const handleClassName = (arg: EventContentArg) => {
    const calendarType = arg.event.extendedProps.calendar;
    const category = categories.find((c) => c.value === calendarType);

    if (category) {
      // Convert checkbox className to event className
      return (
        category.className
          .replace("data-[state=checked]:bg-", "bg-")
          .replace("data-[state=checked]:ring-", "border-")
          .replace("500", "400") + " text-white"
      );
    }
    return "";
  };

  const handleCategorySelection = (category: string) => {
    if (selectedCategory && selectedCategory.includes(category)) {
      setSelectedCategory(selectedCategory.filter((c) => c !== category));
    } else {
      setSelectedCategory([...(selectedCategory || []), category]);
    }
  };

  const filteredEvents = events?.filter((event: any) =>
    selectedCategory?.includes(event.extendedProps.calendar)
  );

  return (
    <div className="grid grid-cols-12 gap-6 divide-x divide-border">
      <Card className="col-span-12 lg:col-span-4 2xl:col-span-3 pb-5">
        <CardContent className="p-0">
          <div className="py-4 text-default-800 font-semibold text-xs uppercase mt-4 mb-2 px-4">
            {t("filter")}
          </div>
          {categories.length > 0 && (
            <ul className="space-y-3 px-4">
              <li className="flex gap-3">
                <Checkbox
                  checked={selectedCategory?.length === categories.length}
                  onClick={() => {
                    if (selectedCategory?.length === categories.length) {
                      setSelectedCategory([]);
                    } else {
                      setSelectedCategory(categories.map((c) => c.value));
                    }
                  }}
                />
                <Label>All</Label>
              </li>
              {categories.map((category) => (
                <li className="flex gap-3" key={category.value}>
                  <Checkbox
                    className={category.className}
                    id={category.label}
                    checked={selectedCategory?.includes(category.value)}
                    onClick={() => handleCategorySelection(category.value)}
                  />
                  <Label htmlFor={category.label}>{category.label}</Label>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="col-span-12 lg:col-span-8 2xl:col-span-9 pt-5">
        <CardContent className="dashcode-app-calendar">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            events={filteredEvents}
            editable={false}
            selectable={false}
            dayMaxEvents={2}
            weekends={true}
            eventClassNames={handleClassName}
            initialView="dayGridMonth"
            datesSet={handleDatesSet}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
