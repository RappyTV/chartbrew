import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Button, Checkbox, Chip, Divider, Input, Link, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Spacer, Tooltip, commonColors } from "@nextui-org/react";
import { TbMathFunctionY, TbProgressCheck } from "react-icons/tb";
import { TwitterPicker, SketchPicker } from "react-color";
import { useParams } from "react-router";
import { LuArrowDown01, LuArrowDown10, LuCheck, LuCheckCircle, LuChevronRight, LuInfo, LuWand2, LuXCircle } from "react-icons/lu";

import Text from "../../../components/Text";
import Row from "../../../components/Row";
import { runQuery, selectCdc, updateCdc } from "../../../slices/chart";
import DatasetAlerts from "./DatasetAlerts";
import { chartColors, primary } from "../../../config/colors";

function ChartDatasetConfig(props) {
  const { chartId, datasetId } = props;

  const [legend, setLegend] = useState("");
  const [formula, setFormula] = useState("");
  const [maxRecords, setMaxRecords] = useState("");
  const [goal, setGoal] = useState("");
  const [dataItems, setDataItems] = useState({});

  const cdc = useSelector((state) => selectCdc(state, chartId, datasetId));
  const chart = useSelector((state) => state.chart.data.find((c) => c.id === chartId));

  const dispatch = useDispatch();
  const params = useParams();

  useEffect(() => {
    if (cdc.formula) {
      setFormula(cdc.formula);
    }
    if (cdc.legend) {
      setLegend(cdc.legend);
    }
    if (cdc.maxRecords) {
      setMaxRecords(cdc.maxRecords);
    }
    if (cdc.goal) {
      setGoal(cdc.goal);
    }
  }, [cdc]);

  useEffect(() => {
    let tempDataItems;
    if (chart.chartData && chart.chartData.data && chart.chartData.data.datasets) {
      // find the dataset in the chart data
      let foundIndex;
      for (let i = 0; i < chart.ChartDatasetConfigs.length; i++) {
        const d = chart.ChartDatasetConfigs[i];
        if (d.id === cdc.id) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex || foundIndex === 0) {
        tempDataItems = chart.chartData.data.datasets[foundIndex];
        tempDataItems = {
          ...tempDataItems,
          labels: chart.chartData.data && chart.chartData.data.labels
        };

        setDataItems(tempDataItems);
      }
    }
  }, [chart, cdc]);

  const _onRunQuery = () => {
    dispatch(runQuery({
      project_id: params.projectId,
      chart_id: chartId,
      cdc_id: cdc.id,
      noSource: true,
      skipParsing: true,
      getCache: true
    }));
  };

  const _onAddFormula = () => {
    setFormula("{val}");
  };

  const _onExampleFormula = () => {
    setFormula("${val / 100}");
    dispatch(updateCdc({
      project_id: params.projectId,
      chart_id: chartId,
      cdc_id: cdc.id,
      data: { formula: "${val / 100}" },
    }));
  };

  const _onRemoveFormula = () => {
    setFormula("");
    dispatch(updateCdc({
      project_id: params.projectId,
      chart_id: chartId,
      cdc_id: cdc.id,
      data: { formula: "" },
    }));
  };

  const _onApplyFormula = () => {
    dispatch(updateCdc({
      project_id: params.projectId,
      chart_id: chartId,
      cdc_id: cdc.id,
      data: { formula },
    }));
  };

  const _onSaveLegend = () => {
    dispatch(updateCdc({
      project_id: params.projectId,
      chart_id: chartId,
      cdc_id: cdc.id,
      data: { legend },
    }));
  };

  const _onUpdateCdc = (data) => {
    dispatch(updateCdc({
      project_id: params.projectId,
      chart_id: chartId,
      cdc_id: cdc.id,
      data,
    }))
      .then(() => {
        _onRunQuery();
      });
  };

  const _getDatasetColor = (datasetColor) => ({
    cursor: "pointer",
    backgroundColor: datasetColor === "rgba(0,0,0,0)" ? primary : datasetColor,
    border: `1px solid ${commonColors.zinc[500]}`
  });

  const _onChangeDatasetColor = (color) => {
    const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;

    _onUpdateCdc({ datasetColor: rgba });
  };

  const _onChangeFillColor = (color, fillIndex) => {
    const rgba = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`;

    if (!fillIndex && fillIndex !== 0) {
      _onUpdateCdc({ fillColor: [rgba] });
    } else {
      const newFillColor = [...cdc.fillColor];
      if (Array.isArray(newFillColor) && newFillColor[fillIndex]) {
        newFillColor[fillIndex] = rgba;
      }
      _onUpdateCdc({ fillColor: newFillColor });
    }
  };

  const _onChangeMultiFill = () => {
    if (!cdc.multiFill) {
      let newFillColor = cdc.fillColor;
      if (!Array.isArray(newFillColor || !newFillColor.length)) {
        newFillColor = [newFillColor];
      } else {
        newFillColor = [...newFillColor];
      }

      if (newFillColor.length < dataItems.labels.length) {
        // add colors sequentially, then restart from the beginning
        for (let i = newFillColor.length; i < dataItems.labels.length; i++) {
          newFillColor.push(chartColors[i % chartColors.length]);
        }
      }

      _onUpdateCdc({ multiFill: true, fillColor: newFillColor });
    } else {
      _onUpdateCdc({ multiFill: false, fillColor: Array.isArray(cdc.fillColor) ? cdc.fillColor[0] : cdc.fillColor });
    }
  };

  return (
    <div>
      <Row align="center">
        <Input
          placeholder="Enter a name for your dataset"
          label="Dataset name"
          value={legend}
          onChange={(e) => setLegend(e.target.value)}
          variant="bordered"
        />
        {legend && legend !== cdc.legend && (
          <>
            <Spacer x={2} />
            <Button
              isIconOnly
              color="success"
              isLoading={false}
              size="sm"
              onClick={_onSaveLegend}
            >
              <LuCheck />
            </Button>
          </>
        )}
      </Row>

      <Spacer y={4} />
      <Divider />
      <Spacer y={2} />
      
      <Row>
        <Text b>{"Dataset settings"}</Text>
      </Row>
      <Spacer y={1} />
      <Row align="center" justify={"space-between"}>
        <Text>Sort records</Text>
        <Row align="center">
          <Tooltip content="Sort the dataset in ascending order">
            <Button
              color={cdc.sort === "asc" ? "secondary" : "default"}
              variant={cdc.sort !== "asc" ? "bordered" : "solid"}
              onClick={() => {
                if (cdc.sort === "asc") {
                  _onUpdateCdc({ sort: "" });
                } else {
                  _onUpdateCdc({ sort: "asc" });
                }
              }}
              isIconOnly
            >
              <LuArrowDown01 />
            </Button>
          </Tooltip>
          <Spacer x={0.5} />
          <Tooltip content="Sort the dataset in descending order">
            <Button
              color={cdc.sort === "desc" ? "secondary" : "default"}
              variant={cdc.sort !== "desc" ? "bordered" : "solid"}
              onClick={() => {
                if (cdc.sort === "desc") {
                  _onUpdateCdc({ sort: "" });
                } else {
                  _onUpdateCdc({ sort: "desc" });
                }
              }}
              isIconOnly
            >
              <LuArrowDown10 />
            </Button>
          </Tooltip>
          {cdc.sort && (
            <>
              <Spacer x={0.5} />
              <Tooltip content="Clear sorting">
                <Link className="text-danger" onClick={() => _onUpdateCdc({ sort: "" })}>
                  <LuXCircle className="text-danger" />
                </Link>
              </Tooltip>
            </>
          )}
        </Row>
      </Row>
      <Spacer y={2} />

      <Row align={"center"} justify={"space-between"}>
        <Text>Max records</Text>
        <Row align="center">
          <Input
            placeholder="Max records"
            value={maxRecords}
            onChange={(e) => setMaxRecords(e.target.value)}
            variant="bordered"
            type="number"
            min={1}
          />
          {maxRecords && (
            <>
              <Spacer x={1} />
                {maxRecords !== cdc.maxRecords && (
                  <>
                    <Tooltip content="Save">
                      <Link className="text-success" onClick={() => _onUpdateCdc({ maxRecords: maxRecords })}>
                        <LuCheckCircle className="text-success" />
                      </Link>
                    </Tooltip>
                    <Spacer x={1} />
                  </>
                )}
                <Tooltip content="Clear limit">
                  <Link
                    className="text-danger"
                    onClick={() => {
                      _onUpdateCdc({ maxRecords: null });
                      setMaxRecords("");
                    }}
                  >
                    <LuXCircle className="text-danger" />
                  </Link>
                </Tooltip>
            </>
          )}
        </Row>
      </Row>

      <Spacer y={4} />
      <Divider />
      <Spacer y={4} />

      <Row>
        {!formula && (
          <Link onClick={_onAddFormula} className="flex items-center cursor-pointer">
            <TbMathFunctionY size={24} />
            <Spacer x={0.5} />
            <Text>Apply formula on metrics</Text>
          </Link>
        )}
        {formula && (
          <div className="col-span-12">
            <div>
              <Popover>
                <PopoverTrigger>
                  <div className="flex flex-row gap-1 items-center">
                    <Text size="sm">
                      {"Metric formula"}
                    </Text>
                    <LuInfo size={18} />
                  </div>
                </PopoverTrigger>
                <PopoverContent>
                  <FormulaTips />
                </PopoverContent>
              </Popover>
            </div>
            <Spacer y={1} />
            <div className="flex flex-row gap-3 items-center w-full">
              <Input
                placeholder="Enter your formula here: {val}"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                variant="bordered"
                fullWidth
              />
              {formula !== cdc.formula && (
                <Tooltip
                  content={"Apply the formula"}
                >
                  <Link onClick={_onApplyFormula}>
                    <LuCheckCircle className={"text-success"} />
                  </Link>
                </Tooltip>
              )}
              <Tooltip content="Remove formula">
                <Link onClick={_onRemoveFormula}>
                  <LuXCircle className="text-danger" />
                </Link>
              </Tooltip>
              <Tooltip content="Click for an example">
                <Link onClick={_onExampleFormula}>
                  <LuWand2 className="text-primary" />
                </Link>
              </Tooltip>
            </div>
          </div>
        )}
      </Row>

      <Spacer y={4} />
      <Divider />
      <Spacer y={4} />

      <Row>
        {!goal && chart.type !== "table" && (
          <div>
            <Link onClick={() => setGoal(1000)} className="flex items-center cursor-pointer">
              <TbProgressCheck size={24} />
              <Spacer x={0.5} />
              <Text>Set a goal</Text>
            </Link>
          </div>
        )}
        {goal && chart.type !== "table" && (
          <div>
            <Row align="center">
              <Text size="sm">{"Goal"}</Text>
              <Spacer x={1} />
              <Tooltip content="A goal can be displayed as a progress bar in your KPI charts. Enter a number without any other characters. (e.g. 1000 instead of 1k)">
                <div><LuInfo size={18} /></div>
              </Tooltip>
            </Row>
            <Spacer y={1} />
            <Row align="center" className={"gap-2"}>
              <Input
                placeholder="Enter your goal here"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                variant="bordered"
              />
              {goal !== cdc.goal && (
                <Tooltip
                  content={"Save goal"}
                >
                  <Link onClick={() => _onUpdateCdc({ goal })}>
                    <LuCheckCircle className={"text-success"} />
                  </Link>
                </Tooltip>
              )}
              <Tooltip content="Remove goal">
                <Link onClick={() => {
                  _onUpdateCdc({ goal: null });
                  setGoal("");
                }}>
                  <LuXCircle className="text-danger" />
                </Link>
              </Tooltip>
            </Row>
          </div>
        )}
      </Row>

      <Spacer y={4} />
      <Divider />
      <Spacer y={4} />

      {chart.type !== "table" && (
        <Row>
          <DatasetAlerts
            chartType={chart.type === "pie"
              || chart.type === "radar"
              || chart.type === "polar"
              || chart.type === "doughnut"
              || chart.type === "table"
              ? "patterns" : "axis"}
            chartId={params.chartId}
            datasetId={cdc.id}
            projectId={params.projectId}
          />
        </Row>
      )}

      <Spacer y={4} />
      <Divider />
      <Spacer y={4} />

      <Row>
        <Text b>{"Dataset colors"}</Text>
      </Row>
      <Spacer y={2} />

      <Row align={"center"} justify={"space-between"}>
        <Text>Primary color</Text>
        <div>
          <Popover>
            <PopoverTrigger>
              <Chip
                style={_getDatasetColor(cdc.datasetColor)}
                size="lg"
                radius="sm"
              />
            </PopoverTrigger>
            <PopoverContent className="border-none bg-transparent shadow-none">
              <TwitterPicker
                triangle={"hide"}
                color={cdc.datasetColor}
                colors={chartColors}
                onChangeComplete={_onChangeDatasetColor}
              />
            </PopoverContent>
          </Popover>
        </div>
      </Row>
      <Spacer y={2} />

      <Row align={"center"} justify={"space-between"}>
        <Row align={"center"}>
          <Checkbox
            isSelected={cdc.fill}
            onChange={() => _onUpdateCdc({ fill: !cdc.fill, fillColor: ["transparent"] })}
            isDisabled={cdc.multiFill}
          >
            Fill Color
          </Checkbox>
        </Row>
        {cdc.fill && !cdc.multiFill && (
          <div>
            <Popover>
              <PopoverTrigger>
                <Chip
                  style={_getDatasetColor(Array.isArray(cdc.fillColor) ? cdc.fillColor[0] : cdc.fillColor)}
                  size="lg"
                  radius="sm"
                />
              </PopoverTrigger>
              <PopoverContent className="border-none bg-transparent shadow-none">
                <SketchPicker
                  color={Array.isArray(cdc.fillColor) ? cdc.fillColor[0] : cdc.fillColor}
                  presetColors={chartColors}
                  onChangeComplete={(color) => _onChangeFillColor(color)}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </Row>
      <Spacer y={2} />

      {chart.type !== "line" && (
        <Row>
          <Checkbox
            isSelected={cdc.multiFill}
            onChange={() => _onChangeMultiFill()}
          >
            Multiple colors
          </Checkbox>
        </Row>
      )}

      {chart.type !== "line" && cdc.multiFill && (
        <>
          <Spacer y={2} />
          <ScrollShadow className="max-h-[300px] border-2 border-solid border-content3 rounded-md p-2">
            {dataItems.labels?.map((label, index) => (
              <Row key={label} justify={"space-between"}>
                <Text size="sm">{label}</Text>

                <div>
                  <Popover>
                    <PopoverTrigger>
                      <Chip
                        style={_getDatasetColor(cdc.fillColor[index] || "white")}
                        radius="sm"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="border-none bg-transparent shadow-none">
                      <TwitterPicker
                        triangle={"hide"}
                        color={cdc.fillColor[index] || "white"}
                        colors={chartColors}
                        onChangeComplete={(color) => _onChangeFillColor(color, index)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </Row>
            ))}
          </ScrollShadow>
          <Spacer y={2} />
        </>
      )}
    </div>
  );
}

ChartDatasetConfig.propTypes = {
  datasetId: PropTypes.number.isRequired,
  chartId: PropTypes.number.isRequired,
};

function FormulaTips() {
  return (
    <div className={"p-4"}>
      <Row>
        <Text b>{"Formulas allow you to manipulate the final results on the Y-Axis"}</Text>
      </Row>
      <Spacer y={1} />
      <Row>
        <Text>{"For"}</Text>
        <Spacer x={0.5} />
        <Text b>{"val = 12345"}</Text>
      </Row>
      <Spacer y={1} />
      <Row align="center">
        <LuChevronRight />
        <Spacer x={0.5} />
        <Text>
          {"{val} => 12345"}
        </Text>
      </Row>
      <Spacer y={1} />
      <Row align="center">
        <LuChevronRight />
        <Spacer x={0.5} />
        <Text>
          {"{val / 100} => 123.45"}
        </Text>
      </Row>
      <Spacer y={1} />
      <Row align="center">
        <LuChevronRight />
        <Spacer x={0.5} />
        <Text>
          {"$ {val / 100} => $ 123.45"}
        </Text>
      </Row>
      <Spacer y={1} />
      <Row align="center">
        <LuChevronRight />
        <Spacer x={0.5} />
        <Text>
          {"{val / 100} USD => 123.45 USD"}
        </Text>
      </Row>
    </div>
  );
}

export default ChartDatasetConfig
