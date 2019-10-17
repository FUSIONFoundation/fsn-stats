import React from 'react';
import {
    Card,
    Row,
    Col,
    Container,
    Badge,
    Button,
    Nav,
    ProgressBar,
    Navbar,
    NavbarBrand,
    NavDropdown,
    Table,
    Form,
    FormControl
} from 'react-bootstrap'
import Fade from 'react-reveal/Fade';
import axios from 'axios';
import ReactCountryFlag from "react-country-flag";
import CountUp from 'react-countup';
import Countdown from 'react-countdown-now';
import Skeleton, {SkeletonTheme} from 'react-loading-skeleton';
import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'
import Spinner from './Spinner';
import {
    BarChart,
    ComposedChart,
    ChartTooltip,
    ResponsiveContainer,
    Line,
    Bar,
    Tooltip,
    YAxis,
    Legend,
    XAxis,
    CartesianGrid
} from 'recharts';
import FontAwesome from 'react-loading-skeleton';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

let W3CWebSocket = require('websocket').w3cwebsocket;


class Main extends React.Component {
    constructor(props) {
        super(props);

        let allNodes = [];
        let identifiers = [];

        let totalNodes = undefined;
        const getData = () => {
                console.log('Retrieving data')
                axios.get('http://93.89.252.58:3002/nodes').then(async function (data) {
                    totalNodes = data.data.length;
                    let nodeData = data.data;
                    for (let node in nodeData) {
                        processStats(nodeData[node]);
                    }
                });
        }

        getData();

        // axios.get('http://93.89.252.58:3002/blocks').then(function (data) {
        //     console.log(data);
        // });

        // axios.get('http://93.89.252.58:3002/info').then(function (data) {
        //     console.log(data);
        // });

        axios.get('http://93.89.252.58:3002/charts').then(function (data) {
            processCharts(data);
        });


        let highestBlock = 0;
        let lastUpdatedBlock = 0;
        const processCharts = (data) => {
            console.log(data);
            let chartData = JSON.parse(data.data[0].charts);
            // let highestBlock = Math.max(...chartData.height);
            let heightChart = chartData.height;
            let avgBlockTime = chartData.avgBlocktime.toString().substr(0, 5);
            let difficulty = Math.max(...chartData.difficulty);

            let blocksChart = [];

            for (let i in chartData.blocktime) {
                blocksChart[i] = {
                    "blocktime": chartData.blocktime[i],
                    "height": chartData.height[i]
                };
            }

            this.setState({
                chartData: heightChart,
                avgBlockTime: avgBlockTime,
                difficulty: difficulty,
                avgBlockTimeChart: blocksChart
            });
        }


        const processStats = async (data) => {
            let id = data.id;
            let stats = JSON.parse(data.stats);
            let info = stats.info;
            let geo = stats.geo;
            stats.id = id;
            stats.info = info;
            stats.geo = geo;

            // Make hash smaller
            stats.stats.block.hash = formatHash(stats.stats.block.hash);

            let objIndex = allNodes.findIndex((value => value.id === id));
            if (objIndex === -1) {
                allNodes.push(stats);
                objIndex = allNodes.findIndex((value => value.id === id));
                identifiers[objIndex] = id;
            } else {
                objIndex = allNodes.findIndex((value => value.id === id));
                identifiers[objIndex] = id;
            }


            if (Object.keys(allNodes).length === totalNodes) {
                this.setState({
                    totalNodes: Object.keys(allNodes).length,
                    nodeIdentifiers: identifiers,
                    nodesList: allNodes
                });
            }

            await processBlocks(stats.stats.block, id);
        }

        const processBlocks = async (data, id) => {
            data.id = id;
            let objIndex = allNodes.findIndex((value => value.id === data.id));
            if (objIndex === -1) {
            } else {
                let propagationChart = [];
                for (let i in data.history) {
                    propagationChart[i] = {
                        "id": i,
                        "value": data.history[i]
                    };
                }

                if (data.number > highestBlock) {
                    highestBlock = data.number;
                    lastUpdatedBlock = new Date().getTime();
                }


                allNodes[objIndex].height = data.number;
                allNodes[objIndex].propagationChart = propagationChart;
                allNodes[objIndex].hash = formatHash(data.hash);
                allNodes[objIndex].blockLastUpdated = (data.timestamp * 1000);

                if (Object.keys(allNodes).length === totalNodes) {
                    console.log(allNodes);
                    allNodes.sort((a, b) => b.height - a.height);
                    this.setState({
                        nodesList: allNodes,
                        highestBlock: highestBlock,
                        lastUpdatedBlock: lastUpdatedBlock,
                        ticketNumber: data.ticketNumber,
                        lastUpdatedData: Date.now() + 5000
                    })

                    allNodes = [];
                    setTimeout(function(){getData()},5000)
                }
            }
        }

        const formatHash = (hash) => {
            let a = hash.length;
            let b = hash.substr(0, 4);
            let c = b + ' ... ' + hash.substr(a - 4, a);
            return c;
        }
    }


    state = {
        highestBlock: undefined,
        chartData: {},
        avgBlockTime: 0,
        difficulty: 0,
        nodesList: [],
        nodeIdentifiers: [],
        totalNodes: undefined,
        avgBlockTimeChart: [],
        lastUpdatedBlock: 0
    }

    render() {

        let pinnedNodes = JSON.parse(localStorage.getItem('pinnedNodes'));
        const setPinnedNode = (nodename) => {
            let data = JSON.parse(localStorage.getItem('pinnedNodes'));
            let u = [];
            if (!Array.isArray(data)) {
                u.push(nodename);
                localStorage.setItem('pinnedNodes', JSON.stringify(u));
            } else {
                let data = JSON.parse(localStorage.getItem('pinnedNodes'));
                data.push(nodename);
                localStorage.setItem('pinnedNodes', JSON.stringify(data));
            }
            console.log(localStorage.getItem('pinnedNodes'))
        }

        const blockClass = (nodeBlock, highestBlock) => {
            if (highestBlock && nodeBlock) {
                if ((highestBlock - nodeBlock) === 1) {
                    return 'text-warn';
                } else if ((highestBlock - nodeBlock) > 1) {
                    return 'text-danger';
                }
            }
            ;
        }

        const RoundedBar = (props) => {
            const {fill, x, y, height} = props;

            return (
                <g>
                    <rect id="Rectangle-3" x={x} y={y} width="3" height={height} fill={fill} rx="1"/>
                    <rect id="Rectangle-3" x={x - 1} y="0" width="4" height="80" fill={fill} fillOpacity="0" rx="1"/>
                </g>
            );
        };
        return <body className={'bg-dark'}>
        <div className={'main-content'}>
            <SkeletonTheme color="#202020" highlightColor="#444">
                <Container fluid={true}>
                    <Row>
                        <Col md={12}>
                            <div className="alert alert-primary mt-2">
                                Work in progress!
                            </div>
                        </Col>
                        <Col md={2}>
                            <div className="card">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h6 className="card-title text-uppercase text-muted mb-2">
                                                Last Block
                                            </h6>
                                            <span className="h2 mb-0">
                                                {this.state.highestBlock || <Spinner/>}
                                            </span>
                                        </div>
                                        <div className="col-auto">
                                            <span className="h2 fe fe-briefcase text-muted mb-0"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col md={2}>
                            <div className="card">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h6 className="card-title text-uppercase text-muted mb-2">
                                                Block Time Ago
                                            </h6>
                                            <span className="h2 mb-0">
                                                {this.state.lastUpdatedBlock ? <TimeAgo date={this.state.lastUpdatedBlock}/> : <Spinner/>}
                                            </span>
                                        </div>
                                        <div className="col-auto">
                                            <span className="h2 fe fe-briefcase text-muted mb-0"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col md={2}>
                            <div className="card">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h6 className="card-title text-uppercase text-muted mb-2">
                                                Average Block Time
                                            </h6>
                                            <span className="h2 mb-0">
                                                {this.state.avgBlockTime || <Spinner/>}
                                            </span>
                                        </div>
                                        <div className="col-auto">
                                            <span className="h2 fe fe-briefcase text-muted mb-0"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col md={2}>
                            <div className="card">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h6 className="card-title text-uppercase text-muted mb-2">
                                                Tickets
                                            </h6>
                                            <span className="h2 mb-0">
                                                {this.state.ticketNumber || <Spinner/>}
                                            </span>
                                        </div>
                                        <div className="col-auto">
                                            <span className="h2 fe fe-briefcase text-muted mb-0"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Col md={12} className={'text-stats'}>
                        <div className={'float-md-left'}>
                            <span className={'mr-2'}>Active Nodes</span> {this.state.totalNodes ? <span className={'nodes-badge p-1'}>{this.state.totalNodes}</span> : <Spinner/>}
                        </div>
                        <div className={'float-md-right'}>
                           Updating In: <TimeAgo date={this.state.lastUpdatedData}/>
                        </div>
                    </Col>
                    <Col className={'table-responsive pt-3'} md={12}>
                        <Table className={'table table-sm table-nowrap card-table'} borderless variant="">
                            <thead className={'text-center text-muted'}>
                            <tr>
                                <th>Pin</th>
                                <th data-toggle="tooltip" data-placement="top" title=""
                                    data-original-title="Tooltip on top">Active
                                </th>
                                <th>Location</th>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Height</th>
                                <th>Block Time</th>
                                <th>Tickets</th>
                                <th>Mining</th>
                                <th>Syncing</th>
                                <th>Peers</th>
                                <th>Uptime</th>
                                <th>Latency</th>
                            </tr>
                            </thead>
                            <tbody className={'text-center'}>
                            {
                                this.state.nodeIdentifiers.map(((key, index) =>
                                        <tr>
                                            <td><a onClick={function () {
                                                setPinnedNode(this.state.nodesList[index].id)
                                            }.bind(this)} className="btn btn-sm btn-rounded-circle btn-white">
                                                +
                                            </a></td>
                                            <td>{this.state.nodesList[index].stats.active ?
                                                <span className="text-success">●</span> :
                                                <span className="text-danger">●</span>}</td>
                                            <td>{this.state.nodesList[index].geo ? <ReactCountryFlag
                                                code={this.state.nodesList[index].geo.country.toLowerCase()}
                                                svg/> : '?'}</td>
                                            <td>{this.state.nodesList[index].id}</td>
                                            <td>{this.state.nodesList[index].info.node}</td>
                                            <td className={blockClass(this.state.nodesList[index].stats.block.number, this.state.highestBlock)}>{this.state.nodesList[index].stats.block.number ||
                                            <Spinner/>} <span
                                                className={'pl-4'}>{this.state.nodesList[index].stats.block.hash}</span>
                                            </td>
                                            <td>{this.state.nodesList[index].stats.block.received ?
                                                <TimeAgo date={this.state.nodesList[index].stats.block.received}/> :
                                                <Spinner/>}</td>
                                            <td>{this.state.nodesList[index].stats.myTicketNumber}</td>
                                            <td>{this.state.nodesList[index].stats.mining ?
                                                <span className="text-success">●</span> :
                                                <span className="text-danger">●</span>}</td>
                                            <td>{this.state.nodesList[index].stats.syncing ?
                                                <span className="text-success">●</span> :
                                                <span className="text-danger">●</span>}</td>
                                            <td>{this.state.nodesList[index].stats.peers}</td>
                                            <td><ProgressBar now={this.state.nodesList[index].stats.uptime}
                                                             label={`${this.state.nodesList[index].stats.uptime}%`}/>
                                            </td>
                                            <td>{this.state.nodesList[index].stats.latency}ms</td>
                                        </tr>
                                ))
                            }
                            </tbody>
                        </Table>
                    </Col>
                </Container>
            </SkeletonTheme>
        </div>
        </body>;
    }
}

export default Main;
