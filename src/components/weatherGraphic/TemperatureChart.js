import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { getMonthlyTemperatureData } from '../../services/weatherService';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, LineController, Title, Tooltip, Legend);

const TemperatureChart = ({ unit, theme }) => {
    const { t } = useTranslation();
    const [chartData, setChartData] = useState({ datasets: [], labels: [] });
    const chartRef = useRef(null);
  
    useEffect(() => {
      const temperatureData = getMonthlyTemperatureData();
      const temperatures = temperatureData.map(data => data.temperature);
      const mean = temperatures.reduce((a, b) => a + b) / temperatures.length;
      const stdDeviation = Math.sqrt(temperatures.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / temperatures.length);
  
      setChartData({
        labels: temperatureData.map(data => data.date),
        datasets: [
          {
            label: `${t('dailyTemperature')}`,
            data: temperatures,
            borderColor: 'blue',
            pointBackgroundColor: 'blue',
            borderWidth: 2,
          },
          {
            label: `${t('averageTemperature')}`,
            data: Array(30).fill(mean),
            borderColor: 'green',
            borderDash: [5, 5],
            fill: false,
          },
          {
            label: `${t('+standarDesviation')}`,
            data: Array(30).fill(mean + stdDeviation),
            borderColor: 'red',
            borderDash: [5, 5],
            fill: false,
          },
          {
            label: `${t('-standarDesviation')}`,
            data: Array(30).fill(mean - stdDeviation),
            borderColor: 'red',
            borderDash: [5, 5],
            fill: false,
          },
        ],
      });
    }, [t]);

    const isDarkMode = theme === 'dark';

    const textColor = isDarkMode ? 'white' : 'black';
    const backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
  
    return (
        <motion.div style={{ backgroundColor }} className={`p-4 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'}`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            exit={{ opacity: 0 }}
        >
          <motion.h2 className="text-2xl text-center font-semibold mb-4" style={{ color: textColor }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            exit={{ opacity: 0 }}
          >
            {t('monthlyWeather')}
          </motion.h2>
          <motion.h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            exit={{ opacity: 0 }}
          >
            {t('weatherVariation')}
          </motion.h3>
          <motion.p className="mt-4 mb-6 text-justify"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            exit={{ opacity: 0 }}
          >
            {t('graphicDesc')}
          </motion.p>
          {chartData && chartData.labels.length > 0 ? (
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                exit={{ opacity: 0 }}
                className="w-full h-[500px] lg:h-[800px]"
            >
                <Line
                    ref={chartRef}
                    data={{
                      ...chartData,
                      datasets: chartData.datasets.map((dataset, index) => ({
                          ...dataset,
                          borderColor:
                              index === 0
                                  ? theme === 'dark' ? '#4F46E5' : '#3B82F6'
                                  : index === 1
                                  ? theme === 'dark' ? '#10B981' : '#16A34A'
                                  : theme === 'dark' ? '#EF4444' : '#F87171',
                          pointBackgroundColor:
                              index === 0
                                  ? theme === 'dark' ? '#4F46E5' : '#3B82F6'
                                  : index === 1
                                  ? theme === 'dark' ? '#10B981' : '#16A34A'
                                  : theme === 'dark' ? '#EF4444' : '#F87171',
                          borderDash: index > 0 ? [5, 5] : undefined,
                          borderWidth: index === 0 ? 2 : 1.5,
                      })),
                    }}
                    options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                        display: true,
                        text: `${t('graphicTitle')}`,
                        color: theme === 'dark' ? 'white' : 'black',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                        },
                        tooltip: {
                        callbacks: {
                            label: function(context) {
                                const unitSymbol = unit === 'metric' ? '°C' : '°F';
                                return t('graphicLabel')
                                    .replace('{label}', context.label)
                                    .replace('{temperature}', context.raw)
                                    .replace('{unitSymbol}', unitSymbol);
                            }
                        }
                        },
                        legend: {
                        position: 'top',
                        labels: {
                            color: theme === 'dark' ? 'white' : 'black',
                            font: {
                            size: 12,
                            }
                        }
                        }
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: `${t('daysMonth')}`,
                          color: theme === 'dark' ? 'white' : 'black',
                          font: {
                            size: 14,
                            weight: 'bold'
                          },
                          padding: {
                            top: 30
                          }
                        },
                        ticks: {
                          color: theme === 'dark' ? 'white' : 'black',
                        },
                        grid: {
                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(128, 128, 128, 0.3)',
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: t('graphicLabel2').replace('{unitSymbol}', unit === 'metric' ? '°C' : '°F'),
                          color: theme === 'dark' ? 'white' : 'black',
                          font: {
                            size: 14,
                            weight: 'bold'
                          }
                        },
                        beginAtZero: false,
                        ticks: {
                          color: theme === 'dark' ? 'white' : 'black',
                          stepSize: 5,
                        },
                        grid: {
                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(128, 128, 128, 0.3)',
                        },
                      },
                    },                    
                    layout: {
                        padding: {
                        left: 10,
                        right: 10,
                        top: 20,
                        bottom: 10
                        }
                    }
                    }}
                    className="p-4 rounded-lg"
                    style={{
                    backgroundColor: theme === 'dark' ? '#111827' : '#F9FAFB',
                    borderRadius: '8px',
                    padding: '20px'
                    }}
                />
            </motion.div>
            ) : (
            <motion.p className={`text-${theme === 'dark' ? 'gray-300' : 'gray-700'}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                exit={{ opacity: 0 }}
            >{t('loadingGraphic')}</motion.p>
            )}
        </motion.div>
      );      
  };  

export default TemperatureChart;