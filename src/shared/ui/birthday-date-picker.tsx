import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import dayjs from "dayjs";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { styled, useTheme } from "styled-components/native";

import { ThemedText } from "./themed-text";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const YEARS_PER_ROW = 3;

const Container = styled.View`
  width: 100%;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const NavButton = styled(Pressable)<{ $disabled?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  opacity: ${({ $disabled }) => ($disabled ? 0.3 : 1)};
`;

const TitleButton = styled(Pressable)`
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 4px;
  padding-vertical: 6px;
`;

const TitleText = styled(ThemedText)`
  font-size: 16px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const WeekdayRow = styled.View`
  flex-direction: row;
  margin-bottom: 4px;
`;

const WeekdayCell = styled.View`
  flex: 1;
  align-items: center;
  padding-vertical: 6px;
`;

const WeekdayText = styled(ThemedText)`
  font-size: 11px;
  letter-spacing: 0.5px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Week = styled.View`
  flex-direction: row;
`;

const DayCellWrapper = styled.View`
  flex: 1;
  aspect-ratio: 1;
  padding: 2px;
`;

const DayCell = styled(Pressable)<{
  $selected?: boolean;
  $today?: boolean;
  $disabled?: boolean;
}>`
  flex: 1;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : "transparent"};
  border-width: ${({ $selected, $today }) =>
    !$selected && $today ? "1px" : "0px"};
  border-color: ${({ theme }) => theme.colors.primary};
  opacity: ${({ $disabled }) => ($disabled ? 0.3 : 1)};
`;

const DayText = styled(ThemedText)<{ $selected?: boolean; $muted?: boolean }>`
  font-size: 14px;
  color: ${({ theme, $selected, $muted }) =>
    $selected
      ? theme.colors.primaryFg
      : $muted
        ? theme.colors.textSecondary
        : theme.colors.text};
  font-family: ${({ theme, $selected }) =>
    $selected
      ? theme.typography.fontFamily.bold
      : theme.typography.fontFamily.regular};
`;

const YearScroll = styled(ScrollView)`
  max-height: 260px;
`;

const YearRow = styled.View`
  flex-direction: row;
`;

const YearCellWrap = styled.View`
  flex: 1;
  padding: 4px;
`;

const YearCell = styled(Pressable)<{ $selected?: boolean }>`
  padding-vertical: 12px;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.surfaceElevated};
`;

const YearText = styled(ThemedText)<{ $selected?: boolean }>`
  font-size: 15px;
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primaryFg : theme.colors.text};
  font-family: ${({ theme, $selected }) =>
    $selected
      ? theme.typography.fontFamily.bold
      : theme.typography.fontFamily.regular};
`;

export type BirthdayDatePickerProps = {
  /** Selected value as YYYY-MM-DD, or empty/undefined if none. */
  value?: string;
  onChange: (value: string) => void;
  /** Latest allowed date (defaults to today). */
  maxDate?: dayjs.Dayjs;
  /** Earliest allowed date (defaults to 1900-01-01). */
  minDate?: dayjs.Dayjs;
};

export function BirthdayDatePicker({
  value,
  onChange,
  maxDate,
  minDate,
}: BirthdayDatePickerProps) {
  const theme = useTheme();
  const today = useMemo(() => dayjs(), []);
  const max = maxDate ?? today;
  const min = minDate ?? dayjs("1900-01-01");

  const parsedValue = useMemo(() => {
    if (!value) return null;
    const parsed = dayjs(value, "YYYY-MM-DD", true);
    return parsed.isValid() ? parsed : null;
  }, [value]);

  // Default the calendar view to ~25 years ago for first-time birthday pickers.
  const initial = useMemo(
    () => parsedValue ?? today.subtract(25, "year"),
    [parsedValue, today],
  );
  const [viewYear, setViewYear] = useState(initial.year());
  const [viewMonth, setViewMonth] = useState(initial.month());
  const [mode, setMode] = useState<"days" | "years">("days");

  const monthLabel = useMemo(
    () => dayjs().year(viewYear).month(viewMonth).format("MMMM YYYY"),
    [viewMonth, viewYear],
  );

  const cells = useMemo(() => {
    const firstOfMonth = dayjs().year(viewYear).month(viewMonth).date(1);
    const startWeekday = firstOfMonth.day();
    const daysInMonth = firstOfMonth.daysInMonth();
    const result: (dayjs.Dayjs | null)[] = [];
    for (let i = 0; i < startWeekday; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(firstOfMonth.date(d));
    while (result.length < 42) result.push(null);
    return result;
  }, [viewMonth, viewYear]);

  const weeks = useMemo(() => {
    const result: (dayjs.Dayjs | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      result.push(cells.slice(i, i + 7));
    }
    return result;
  }, [cells]);

  const goPrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const goNextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const handleDayPress = useCallback(
    (d: dayjs.Dayjs) => {
      onChange(d.format("YYYY-MM-DD"));
    },
    [onChange],
  );

  const handleYearPress = useCallback((y: number) => {
    setViewYear(y);
    setMode("days");
  }, []);

  // Disable prev/next nav when it would cross the min/max boundary.
  const firstVisible = useMemo(
    () => dayjs().year(viewYear).month(viewMonth).date(1),
    [viewMonth, viewYear],
  );
  const lastVisible = useMemo(
    () => firstVisible.endOf("month"),
    [firstVisible],
  );
  const prevDisabled = firstVisible.subtract(1, "day").isBefore(min, "day");
  const nextDisabled = lastVisible.add(1, "day").isAfter(max, "day");

  // Year list for year-picker mode (newest at top).
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = max.year(); y >= min.year(); y--) list.push(y);
    return list;
  }, [max, min]);

  const yearRows = useMemo(() => {
    const rows: number[][] = [];
    for (let i = 0; i < years.length; i += YEARS_PER_ROW) {
      rows.push(years.slice(i, i + YEARS_PER_ROW));
    }
    return rows;
  }, [years]);

  return (
    <Container>
      <HeaderRow>
        <NavButton
          onPress={goPrevMonth}
          disabled={prevDisabled || mode === "years"}
          $disabled={prevDisabled || mode === "years"}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color={theme.colors.text}
          />
        </NavButton>
        <TitleButton
          onPress={() => setMode((m) => (m === "days" ? "years" : "days"))}
          accessibilityRole="button"
          accessibilityLabel={
            mode === "days" ? "Pick a year" : "Back to calendar"
          }
        >
          <TitleText type="default">{monthLabel}</TitleText>
          <MaterialCommunityIcons
            name={mode === "days" ? "chevron-down" : "chevron-up"}
            size={18}
            color={theme.colors.text}
          />
        </TitleButton>
        <NavButton
          onPress={goNextMonth}
          disabled={nextDisabled || mode === "years"}
          $disabled={nextDisabled || mode === "years"}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={theme.colors.text}
          />
        </NavButton>
      </HeaderRow>

      {mode === "days" ? (
        <>
          <WeekdayRow>
            {WEEKDAY_LABELS.map((label, idx) => (
              <WeekdayCell key={`wd-${idx}`}>
                <WeekdayText type="caption">{label}</WeekdayText>
              </WeekdayCell>
            ))}
          </WeekdayRow>
          {weeks.map((week, wi) => (
            <Week key={`week-${wi}`}>
              {week.map((day, di) => {
                if (!day) {
                  return <DayCellWrapper key={`empty-${wi}-${di}`} />;
                }
                const dateStr = day.format("YYYY-MM-DD");
                const isSelected =
                  parsedValue != null &&
                  day.isSame(parsedValue, "day");
                const isToday = day.isSame(today, "day");
                const isDisabled =
                  day.isBefore(min, "day") || day.isAfter(max, "day");
                return (
                  <DayCellWrapper key={dateStr}>
                    <DayCell
                      onPress={() => handleDayPress(day)}
                      disabled={isDisabled}
                      $selected={isSelected}
                      $today={isToday}
                      $disabled={isDisabled}
                      accessibilityRole="button"
                      accessibilityLabel={day.format("MMMM D, YYYY")}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <DayText
                        type="default"
                        $selected={isSelected}
                        $muted={isDisabled}
                      >
                        {day.date()}
                      </DayText>
                    </DayCell>
                  </DayCellWrapper>
                );
              })}
            </Week>
          ))}
        </>
      ) : (
        <YearScroll showsVerticalScrollIndicator={false}>
          {yearRows.map((row, ri) => (
            <YearRow key={`yr-${ri}`}>
              {row.map((y) => (
                <YearCellWrap key={`y-${y}`}>
                  <YearCell
                    onPress={() => handleYearPress(y)}
                    $selected={y === viewYear}
                    accessibilityRole="button"
                    accessibilityLabel={String(y)}
                    accessibilityState={{ selected: y === viewYear }}
                  >
                    <YearText type="default" $selected={y === viewYear}>
                      {y}
                    </YearText>
                  </YearCell>
                </YearCellWrap>
              ))}
              {row.length < YEARS_PER_ROW
                ? Array.from({ length: YEARS_PER_ROW - row.length }).map(
                    (_, i) => <YearCellWrap key={`yp-${ri}-${i}`} />,
                  )
                : null}
            </YearRow>
          ))}
        </YearScroll>
      )}
    </Container>
  );
}
