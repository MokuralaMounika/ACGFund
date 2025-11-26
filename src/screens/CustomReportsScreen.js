// src/screens/CustomReportsScreen.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import XLSX from "xlsx";

import {
  fetchCustomReportsList,
  fetchCustomReportData,
} from "../services/api"; // <-- ensure these exist in services/api

/* ===========================================================
   CustomReportsScreen (Option A) - Full
   - Top filter row (outside box): Type dropdown, Operation dropdown, From, To, Reset
   - Inside card: Title (left), Search + Export (right)
   - Auto-load report data when operation/report selection changes
   - Table: first 5 columns visible; if >5 columns show Details column (eye) as 6th column
   - Text wrap for long values
   - Export to Excel uses same pattern as other screens
   ============================================================ */

const SCREEN_MIN_DROPDOWN_WIDTH = 260;

export default function CustomReportsScreen({ navigation }) {
  // UI state
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsRaw, setReportsRaw] = useState([]); // raw array from API
  const [groupedByType, setGroupedByType] = useState({}); // { type: [{ label, value, fullLabel }, ...] }
  const [typeOptions, setTypeOptions] = useState([]); // [{label,value}]
  const [selectedType, setSelectedType] = useState(null); // {label,value}
  const [selectedOperation, setSelectedOperation] = useState(null); // {label,value,fullLabel}
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  // dropdown absolute lists
  const [openDropdown, setOpenDropdown] = useState(null); // "type" | "operation" | null
  const typeLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const opLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const dropAnim = useRef(new Animated.Value(0)).current;

  // Data table
  const [reportData, setReportData] = useState([]); // array of rows (objects)
  const [dataLoading, setDataLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Pagination / misc
  const [exporting, setExporting] = useState(false);

  // datepicker availability check (dynamic require to avoid crash if native module isn't linked)
  // let NativeDateTimePicker = null;
  // try {
  //   NativeDateTimePicker = require("@react-native-community/datetimepicker");
  // } catch (e) {
  //   NativeDateTimePicker = null;
  // }

  /* ============================
     LOAD REPORTS LIST (group into types+operations)
     ============================ */
  useEffect(() => {
    (async () => {
      setLoadingReports(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");
        if (!token || !userId) {
          setReportsRaw([]);
          setGroupedByType({});
          setTypeOptions([]);
          setErrorMessage("Missing login session.");
          return;
        }

        const arr = await fetchCustomReportsList(userId, token); // expects array
        // arr items may have AdminCustomReportName and AdminCustomReportID
        setReportsRaw(arr || []);

        // group like original web code: split AdminCustomReportName by " - "
        const grouped = {};
        for (const r of arr || []) {
          const name = r?.AdminCustomReportName ?? r?.AdminCustomReportID ?? "";
          const id = r?.AdminCustomReportID ?? r?.AdminCustomReportId ?? r?.AdminCustomReportID;
          if (!name || !id) continue;
          const parts = name.split(" - ").map((p) => p.trim());
          if (parts.length >= 2) {
            const type = parts[0];
            const op = parts.slice(1).join(" - ");
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push({
              label: op,
              value: id,
              fullLabel: name,
            });
          } else {
            // If no " - " use as type with one op (label same)
            const type = parts[0] || "Other";
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push({
              label: parts[0],
              value: id,
              fullLabel: name,
            });
          }
        }

        const types = Object.keys(grouped);
        setGroupedByType(grouped);
        setTypeOptions(types.map((t) => ({ label: t, value: t })));
        if (types.length === 0) {
          // fallback: show all as a single type using AdminCustomReportName values
          setTypeOptions([]);
        }
        setErrorMessage("");
      } catch (err) {
        console.error("[CustomReports] loadReports error:", err);
        setReportsRaw([]);
        setGroupedByType({});
        setTypeOptions([]);
        setErrorMessage("Failed to load reports.");
      } finally {
        setLoadingReports(false);
      }
    })();
  }, []);

  /* =========================================================================
     Determine operationOptions based on selectedType:
     - if no selectedType, show flatten of all operations (unique)
     - else show groupedByType[selectedType.value]
     ========================================================================= */
  const operationOptions = useMemo(() => {
    if (selectedType?.value && groupedByType[selectedType.value]) {
      return groupedByType[selectedType.value];
    }
    // flatten unique
    const all = [];
    for (const t of Object.values(groupedByType)) {
      for (const op of t) all.push(op);
    }
    // dedupe by value
    const uniq = [];
    const seen = new Set();
    for (const o of all) {
      if (!seen.has(o.value + "|" + o.label)) {
        seen.add(o.value + "|" + o.label);
        uniq.push(o);
      }
    }
    return uniq;
  }, [selectedType, groupedByType]);

  /* ======================================================
     Fetch report data automatically when selectedOperation (or selectedType+operation),
     or when fromDate/toDate changes (user asked to dynamically show result).
     ====================================================== */
  useEffect(() => {
    let aborted = false;
    (async () => {
      // need token, userId
      if (!selectedOperation?.value) {
        setReportData([]);
        return;
      }
      setDataLoading(true);
      setErrorMessage("");
      try {
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");
        if (!token || !userId) {
          setErrorMessage("Missing login session.");
          setReportData([]);
          return;
        }

        // convert dates: already in mm-dd-yyyy required by you; backend expects mm-dd-yyyy (you said)
        const rows = await fetchCustomReportData(
          userId,
          selectedOperation.value,
          token,
          fromDate || "",
          toDate || ""
        );

        if (aborted) return;
        // rows expected to be array of objects
        setReportData(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error("[CustomReports] fetch report data:", err);
        setReportData([]);
        setErrorMessage("Failed to load report data.");
      } finally {
        if (!aborted) setDataLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [selectedOperation, fromDate, toDate]);

  /* =========================
     Dropdown open animation helper
     ========================= */
  function toggleDropdown(which) {
    if (openDropdown === which) {
      setOpenDropdown(null);
      Animated.timing(dropAnim, { toValue: 0, duration: 140, useNativeDriver: true }).start();
    } else {
      setOpenDropdown(which);
      Animated.timing(dropAnim, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    }
  }

  /* =========================
     Export to Excel (uses filtered by search)
     ========================= */
  const filteredReportData = useMemo(() => {
    if (!search?.trim()) return reportData;
    const q = search.trim().toLowerCase();
    return reportData.filter((r) =>
      Object.values(r).some((v) => (v ?? "").toString().toLowerCase().includes(q))
    );
  }, [reportData, search]);

  async function exportToExcel() {
    if (!filteredReportData || filteredReportData.length === 0) {
      Alert.alert("No data", "No report data to export.");
      return;
    }
    try {
      setExporting(true);
      const ws = XLSX.utils.json_to_sheet(filteredReportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const filePath = `${RNFS.DownloadDirectoryPath}/CustomReport_${Date.now()}.xlsx`;
      await RNFS.writeFile(filePath, wbout, "base64");
      await Share.open({
        title: "Export Report",
        url: `file://${filePath}`,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    } catch (err) {
      console.error("Export error:", err);
      Alert.alert("Export failed", "Unable to export to Excel.");
    } finally {
      setExporting(false);
    }
  }

  /* =========================
     Table helpers: decide visibleColumns and whether to show details column
     ========================= */
  const allColumns = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    return Object.keys(reportData[0]);
  }, [reportData]);

  const showDetailsColumn = allColumns.length > 5;
  const visibleColumns = useMemo(() => {
    if (allColumns.length <= 5) return allColumns;
    return allColumns.slice(0, 5);
  }, [allColumns]);

  /* =========================
     Render dropdown absolute list
     ========================= */
  const renderDropdownList = () => {
    if (!openDropdown) return null;
    const isType = openDropdown === "type";
    const data = isType
      ? typeOptions
      : operationOptions.map((o) => ({ label: o.label, value: o.value, fullLabel: o.fullLabel }));

    const layout = isType ? typeLayout.current : opLayout.current;
    const top = layout.y + layout.height + 6;
    const left = Math.max(8, layout.x);
    const width = Math.max(Math.min(layout.width || SCREEN_MIN_DROPDOWN_WIDTH, Dimensions.get("window").width - 32), SCREEN_MIN_DROPDOWN_WIDTH);

    return (
      <Pressable style={styles.dropdownBackdrop} onPress={() => setOpenDropdown(null)}>
        <Animated.View style={[styles.dropdownList, { top, left, width, opacity: dropAnim, transform: [{ scale: dropAnim }] }]}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 300 }}>
            {data.length === 0 ? (
              <View style={styles.dropdownItem}><Text style={styles.dropdownItemText}>No items</Text></View>
            ) : (
              data.map((d, idx) => (
                <TouchableOpacity
                  key={d.value ?? d.label ?? idx}
                  style={styles.dropdownItem}
                  onPress={() => {
                    if (isType) {
                      setSelectedType({ label: d.label, value: d.value });
                      setSelectedOperation(null);
                    } else {
                      setSelectedOperation({ label: d.label, value: d.value, fullLabel: d.fullLabel });
                    }
                    setOpenDropdown(null);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{d.label}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Animated.View>
      </Pressable>
    );
  };

  /* =========================
     Render table header & rows
     ========================= */
  const renderTableHeader = () => {
    if (!visibleColumns.length) return null;
    return (
      <View style={[styles.row, styles.headerRow]}>
        {visibleColumns.map((col, i) => (
          <Text key={col} style={[styles.headerCell, { flex: 1 }]} numberOfLines={1}>
            {col}
          </Text>
        ))}
        {showDetailsColumn && <Text style={[styles.headerCell, { width: 64 }]}>Details</Text>}
      </View>
    );
  };

  const renderTableRows = () => {
    if (!reportData || reportData.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="bar-chart-outline" size={48} color="#BCC9DB" />
          <Text style={styles.emptyText}>Select a report and operation. Results will appear here.</Text>
          <View style={styles.hintRow}>
            <Text style={styles.hintText}>{selectedType ? `Type: ${selectedType.label}` : "Type: -"}</Text>
            
          </View>
        </View>
      );
    }

    return reportData.map((row, idx) => {
      return (
        <View key={idx} style={[styles.row, styles.dataRow]}>
          {visibleColumns.map((col) => (
            <Text key={col} style={[styles.cell, { flex: 1, flexWrap: "wrap" }]}>{row[col] == null ? "" : String(row[col])}</Text>
          ))}

          {showDetailsColumn && (
            <TouchableOpacity
              style={{ width: 64, alignItems: "flex-start", paddingLeft: 6 }}
              onPress={() => navigation.navigate("CustomReportRowDetails", { row })}
            >
              <Icon name="eye-outline" size={20} color="#7A1E1E" />
            </TouchableOpacity>
          )}
        </View>
      );
    });
  };

  /* =========================
     Reset handler for filters
     ========================= */
  function handleReset() {
    setSelectedType(null);
    setSelectedOperation(null);
    setFromDate("");
    setToDate("");
    setSearch("");
    setReportData([]);
  }

  /* =========================
     Render
     ========================= */
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        {/* TOP FILTER AREA OUTSIDE BOX */}
        <View style={styles.topHeaderRow}>
          <Text style={styles.topTitle}>Custom Reports</Text>
        </View>

        <View style={styles.topFilters}>
          {/* Type dropdown */}
          <View style={styles.dropWrapper} onLayout={(e) => (typeLayout.current = e.nativeEvent.layout)}>
            <TouchableOpacity style={styles.selectBox} onPress={() => toggleDropdown("type")}>
              <Text style={[styles.selectText, !selectedType && styles.placeholder]}>
                {selectedType?.label || "Select Report"}
              </Text>
              <Icon name="chevron-down" size={18} color="#5A6B7A" />
            </TouchableOpacity>
          </View>

          {/* Operation dropdown */}
          <View style={styles.dropWrapper} onLayout={(e) => (opLayout.current = e.nativeEvent.layout)}>
            <TouchableOpacity style={styles.selectBox} onPress={() => toggleDropdown("operation")}>
              <Text style={[styles.selectText, !selectedOperation && styles.placeholder]}>
                {selectedOperation?.label || "Select Report Type"}
              </Text>
              <Icon name="chevron-down" size={18} color="#5A6B7A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dates + reset */}
        <View style={styles.datesRow}>
          <View style={styles.dateBox}>
            <TextInput
              placeholder="mm-dd-yyyy"
              value={fromDate}
              onChangeText={setFromDate}
              style={styles.dateInput}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.calButton} onPress={() => {
              if (NativeDateTimePicker) {
                // if native picker exists, we prompt the user to type for now (keep stable)
                Alert.alert("Date Picker", "Native date picker is available in your build. Use keyboard or integrate picker flow.");
              } else {
                Alert.alert("Date", "Type date as mm-dd-yyyy");
              }
            }}>
              <Icon name="calendar-outline" size={18} color="#445" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateBox}>
            <TextInput
              placeholder="mm-dd-yyyy"
              value={toDate}
              onChangeText={setToDate}
              style={styles.dateInput}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.calButton} onPress={() => {
              if (NativeDateTimePicker) {
                Alert.alert("Date Picker", "Native date picker is available in your build. Use keyboard or integrate picker flow.");
              } else {
                Alert.alert("Date", "Type date as mm-dd-yyyy");
              }
            }}>
              <Icon name="calendar-outline" size={18} color="#445" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Icon name="refresh" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* REPORT CARD */}
        <View style={styles.reportCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Custom Reports</Text>

            <View style={styles.cardActions}>
              <TextInput
                placeholder="Search..."
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
              <TouchableOpacity style={styles.exportBtn} onPress={exportToExcel} disabled={exporting}>
                <Icon name="download-outline" size={16} color="#0B2E4F" />
                <Text style={styles.exportText}>Export</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loadingReports ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#7A1E1E" />
              <Text style={{ marginTop: 8 }}>Loading reports...</Text>
            </View>
          ) : (
            <>
              {/* Table header */}
              <View style={{ marginTop: 6 }}>{renderTableHeader()}</View>

              {/* Data or empty */}
              <View style={{ marginTop: 6 }}>
                {dataLoading ? (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#7A1E1E" />
                    <Text style={{ marginTop: 10 }}>Loading report data...</Text>
                  </View>
                ) : (
                  <View>
                    {renderTableRows()}
                    {/* show count line like Advisors screen */}
                    <View style={styles.countRow}>
                      <Text style={styles.countText}>
                        Results: {filteredReportData.length} {reportData.length ? `of ${reportData.length}` : ""}
                      </Text>
                    </View>
                    {errorMessage ? <Text style={{ color: "crimson", marginTop: 8 }}>{errorMessage}</Text> : null}
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Absolute dropdown list */}
      {renderDropdownList()}
    </View>
  );
}

/* ===========================
   STYLES
   =========================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA", paddingTop: 12 },

  topHeaderRow: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: "600", // semi-bold medium-large as requested
    color: "#0B2E4F",
  },

  topFilters: {
    paddingHorizontal: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  dropWrapper: { flex: 1, paddingHorizontal: 6 },

  selectBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E1E6EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },

  selectText: { fontSize: 14, color: "#0B2E4F" },
  placeholder: { color: "#9CA6B1" },

  datesRow: {
    marginTop: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dateBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E1E6EB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 48,
    marginRight: 8,
  },

  dateInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 6,
    paddingVertical: 0,
    fontSize: 14,
  },

  calButton: { paddingLeft: 8 },

  resetBtn: {
    backgroundColor: "#0B2E4F",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  reportCard: {
    marginTop: 16,
    marginHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E3E7EE",
    overflow: "hidden",
  },

  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardTitle: { flex: 1, fontWeight: "700", fontSize: 16, color: "#0B2E4F" },

  cardActions: { flexDirection: "row", alignItems: "center", gap: 8 },

  searchInput: {
    height: 40,
    minWidth: 140,
    backgroundColor: "#F3F6FA",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },

  exportBtn: {
    backgroundColor: "#F3F6FA",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },

  exportText: { marginLeft: 6, color: "#0B2E4F" },

  /* Table styles */
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
  },
  headerRow: { backgroundColor: "#F3F6FA", paddingHorizontal: 6 },
  headerCell: { fontSize: 12, fontWeight: "700", color: "#333", flex: 1 },
  dataRow: { backgroundColor: "#FFF", paddingHorizontal: 6 },
  cell: { fontSize: 12, color: "#000", flexWrap: "wrap" },

  emptyState: { alignItems: "center", paddingVertical: 22 },
  emptyText: { marginTop: 10, color: "#6E7B86", textAlign: "center" },
  hintRow: { marginTop: 8, flexDirection: "row", gap: 10 },
  hintText: { fontSize: 12, color: "#8A98A3" },

  loadingBox: { alignItems: "center", paddingVertical: 20 },

  countRow: { paddingVertical: 10, alignItems: "flex-start" },
  countText: { color: "#6E7B86", fontSize: 12 },

  /* Dropdown absolute list */
  dropdownBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  dropdownList: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9EEF3",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    maxHeight: 300,
    zIndex: 9999,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderColor: "#F1F3F5" },
  dropdownItemText: { fontSize: 15, color: "#0B2E4F" },
});
