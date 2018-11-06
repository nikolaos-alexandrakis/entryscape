import chartist from 'chartist';
import DOMUtil from 'commons/util/htmlUtil';
import chartistPluginLegend from 'chartist-plugin-legend';

    let counter = 0;
    const renderChart = function(node, data, items) {
        const f = (loadedData) => {
            counter += 1;
            const idClass = 'chartist_' + counter;

            const div = DOMUtil.create('div', {class: idClass+' '+data.proportion});
            if (data.width) {
                div.style.width= parseInt(data.width) == data.width ? data.width + 'px' : data.width;

            } else {
                div.style.width ='100%';
            }
            if (data.options.axisX && data.options.axisX.type) {
                data.options.axisX.type = Chartist[data.options.axisX.type];
            }
            if (data.options.axisY && data.options.axisY.type) {
                data.options.axisY.type = Chartist[data.options.axisY.type];
            }

            if (data.limit) {
                loadedData.labels = loadedData.labels.slice(0, data.limit);
                if (Array.isArray(loadedData.series[0])) {
                    loadedData.series = loadedData.series.map((t) => {
                        return t.slice(0, data.limit);
                    })
                } else {
                    loadedData.series = loadedData.series.slice(0, data.limit);
                }
            }
            if (data.legend) {
                data.options.plugins = [
                    Chartist.plugins.legend({
                        position: 'bottom',
                        legendNames: loadedData.labels.map((l, idx) => `${l} (${loadedData.series[idx]})`),
                    })
                ];
                data.options.labelInterpolationFnc = function(value) {
                    return "";
                };
                delete loadedData.labels;
            }
            new Chartist[data.type]('.' + idClass, loadedData, data.options, data.responsiveOptions);
        }
        if (data.data) {
            f(data.data);
        } else if (data.url) {
            require([data.url], function(loadedData) {
                f(loadedData);
            })
        }
    };

export default renderChart;
