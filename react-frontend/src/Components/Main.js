/* eslint-disable */
import React from 'react';
import {Button, Col, Container, Modal, ProgressBar, Row, Table,} from 'react-bootstrap'
import NumberFormat from 'react-number-format';
import Tooltip from '@material-ui/core/Tooltip';
import Delay from './Delay';
import axios from 'axios';
import Datamap from 'react-datamaps';
import ReactCountryFlag from "react-country-flag";
import TimeAgo from 'react-timeago';
import customStrings from './timeAgo/customStrings'
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'
import Spinner from './Spinner';
import AttentionWarning from './AttentionWarning';
import FusionLogo from '../img/Fusion_White.svg';


class Main extends React.Component {
    constructor(props) {
        super(props);

        let URL = 'https://api-stats.fusionnetwork.io';
        let allNodes = [];
        let identifiers = [];

        let totalNodes = 0;
        const getData = () => {
            console.log('Retrieving data')
            let countNodes = 0;
            axios.get(`${URL}/nodes`).then(async function (data) {
                let nodeData = data.data;
                for (let node in nodeData) {
                    countNodes++;
                    if (nodeData.length === (parseInt(node) + 1)) {
                        totalNodes = countNodes;
                    }
                    processStats(nodeData[node]);
                }
            });
        }

        getData();

        // axios.get(`${URL}/charts`).then(function (data) {
        //     if (data.data.length > 0) processCharts(data);
        // });

        let highestVersion = "";
        let highestBlock = 0;
        let lastUpdatedBlock = 0;
        let pendingTransactions = 0;
        // const processCharts = (data) => {
        //     let chartData = JSON.parse(data.data[0].charts);
        //     // let highestBlock = Math.max(...chartData.height);
        //     let heightChart = chartData.height;
        //     let avgBlockTime = chartData.avgBlocktime.toString().substr(0, 5);
        //     let difficulty = Math.max(...chartData.difficulty);
        //
        //     let blocksChart = [];
        //
        //     for (let i in chartData.blocktime) {
        //         blocksChart[i] = {
        //             "blocktime": chartData.blocktime[i],
        //             "height": chartData.height[i]
        //         };
        //     }
        //
        //     this.setState({
        //         chartData: heightChart,
        //         avgBlockTime: avgBlockTime,
        //         difficulty: difficulty,
        //         avgBlockTimeChart: blocksChart
        //     });
        // }

        const getVersionNumber = (string) => {
            let vIndex = string.indexOf('v');
            let minV = string.substring(vIndex + 1, string.length);
            let dashIndex = minV.indexOf('-');
            return minV.substring(0, dashIndex);
        }

        let geoCharts = [];
        const processStats = async (data) => {
            let id = data.id;
            let stats = JSON.parse(data.stats);
            let info = stats.info;
            let geo = stats.geo;
            stats.id = id;
            stats.info = info;
            stats.geo = geo;

            if (geo !== null) {
                let geoData = {
                    name: id,
                    radius: 2,
                    latitude: geo.ll[0],
                    longitude: geo.ll[1],
                    fillKey: 'bubbleFill'
                };
                geoCharts.push(geoData);
            }

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
                    nodesList: allNodes,
                    geoCharts: geoCharts
                });
                this.forceUpdate();
            }

            await processBlocks(stats.stats.block, id, getVersionNumber(stats.info.node));
        }


        let totalTickets = 0;

        const processBlocks = async (data, id, version) => {
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

                if (version > highestVersion) {
                    highestVersion = version;
                }

                if (version === highestVersion && data.number > highestBlock) {
                    highestBlock = data.number;
                    lastUpdatedBlock = data.received;
                    totalTickets = data.ticketNumber;
                    pendingTransactions = allNodes[objIndex].stats.pending;
                }

                allNodes[objIndex].version = version;
                allNodes[objIndex].height = data.number;
                allNodes[objIndex].propagationChart = propagationChart;
                allNodes[objIndex].hash = formatHash(data.hash);
                allNodes[objIndex].blockLastUpdated = (data.received * 1000);

                if (Object.keys(allNodes).length === totalNodes) {
                    allNodes.sort((a, b) => {
                        if (a.version < b.version) {
                            return 1;
                        } else if (a.version > b.version) {
                            return -1;
                        } else {
                            return b.height - a.height;
                        }
                    });
                    this.setState({
                        nodesList: allNodes,
                        highestBlock: highestBlock,
                        lastUpdatedBlock: lastUpdatedBlock,
                        ticketNumber: totalTickets,
                        lastUpdatedData: Date.now() + 5000,
                        pendingTransactions: pendingTransactions
                    })

                    allNodes = [];
                    identifiers = [];
                    setTimeout(function () {
                        getData()
                    }, 10000)
                }
            }
        }

        const formatHash = (hash) => {
            let a = hash.length;
            let b = hash.substring(0, 4);
            return b + ' ... ' + hash.substring(a - 4, a);
        }
    }


    state = {
        highestBlock: undefined,
        chartData: {},
        avgBlockTime: 12.99,
        difficulty: 0,
        nodesList: [],
        nodeIdentifiers: [],
        totalNodes: undefined,
        avgBlockTimeChart: [],
        lastUpdatedBlock: 0
    }

    render() {

        let pinnedNodes = JSON.parse(localStorage.getItem('pinnedNodes')) === null ? [] : JSON.parse(localStorage.getItem('pinnedNodes'));
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
            this.forceUpdate();
        }

        const removePinnedNode = (nodename) => {
            let data = JSON.parse(localStorage.getItem('pinnedNodes'));
            const filteredItems = data.filter(item => item !== nodename);
            localStorage.setItem('pinnedNodes', JSON.stringify(filteredItems));
            if (filteredItems.length === 0) {
                this.setState({
                    hideNonPinned: false
                })
            }

            this.forceUpdate();
        }

        const getVersionNumber = (string) => {
            let vIndex = string.indexOf('v');
            let minV = string.substring(vIndex + 1, string.length);
            let dashIndex = minV.indexOf('-');
            return minV.substring(0, dashIndex);
        }


        const blockClass = (nodeBlock, highestBlock, version) => {
            if (parseInt(version.substring(0, 1)) < 5) {
                return 'text-danger';
            } else if (highestBlock && nodeBlock) {
                if ((highestBlock - nodeBlock) === 1) {
                    return 'text-warn';
                } else if ((highestBlock - nodeBlock) > 1) {
                    return 'text-danger';
                }
            }
        }

        const latencyClass = (latency) => {
            if (latency > 100) {
                return 'text-warn'
            } else if (latency >= 1000) {
                return 'text-danger';
            }
        };

        const setShow = (state, id) => {
            return this.setState({
                showModal: state,
                showDetailsId: id
            });
        };

        const handleClose = () => setShow(false);
        const handleShow = () => setShow(true);

        const setNonPinned = (state) => {
            this.setState({
                hideNonPinned: state
            });
            this.forceUpdate();
        };

        const getTicketPercentage = (totalTickets, nodeTicket) => {
            if (totalTickets && nodeTicket) {
                if (nodeTicket === 0) {
                    return '0% of all tickets';
                } else {
                    let o = totalTickets / 100;
                    return `${(nodeTicket / o).toFixed(2)}% of all tickets`;
                }
            }
        }

        const formatter = buildFormatter(customStrings);

        return <body className={'bg-dark'}>
        <div className={'main-content'}>
            <Modal show={this.state.showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Geo Map</Modal.Title>
                </Modal.Header>
                {this.state.geoCharts && this.state.showModal ?
                    <Delay waitBeforeShow={200}>
                        <Datamap
                            fills={{
                                defaultFill: '#152e4d',
                                bubbleFill: '#ebebeb'
                            }}
                            responsive={true}
                            bubbles={this.state.geoCharts}
                        /> </Delay>
                    : <Spinner/>}

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Container fluid={true}>
                <Row>
                    <Col md={12}>
                        <div className="row">
                            <div className="col-md-6">
                                <img src={FusionLogo} width="200px" className={'p-2'} alt=""/>
                            </div>
                        </div>
                    </Col>
                    <Col md={12}>
                        <div className="alert alert-primary mt-2">
                            <div className="row">
                                <div className="col-6">
                                        <span className={'text-white'}>
                                        This monitor does not represent the entire state of the FUSION Network.
                                        </span>
                                </div>
                                <div className="col-6 text-md-right">
                                    <a className="text-white" href="https://fusion.org">Learn more about FUSION <i
                                        className="fe fe-external-link mb-0"/></a>
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
                                            Last Block
                                        </h6>
                                        <span className="h2 mb-0">
                                                {this.state.highestBlock ?
                                                    <NumberFormat value={this.state.highestBlock} displayType={'text'}
                                                                  thousandSeparator={true} prefix={"# "}/>
                                                    : <Spinner/>}
                                            </span>
                                    </div>
                                    <div className="col-auto">
                                        <span className="h2 fe fe-box text-muted mb-0"></span>
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
                                                {this.state.lastUpdatedBlock ?
                                                    <TimeAgo date={this.state.lastUpdatedBlock}
                                                             formatter={formatter}/> : <Spinner/>}
                                            </span>
                                    </div>
                                    <div className="col-auto">
                                        <span className="h2 fe fe-clock text-muted mb-0"></span>
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
                                    <div className="col-auto text-center">
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
                                        <span className="h2 fe fe-credit-card text-muted mb-0"></span>
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
                                            Pending Txs
                                        </h6>
                                        <span className="h2 mb-0">
                                                {this.state.pendingTransactions || 0}
                                            </span>
                                    </div>
                                    <div className="col-auto">
                                        <span className="h2 fe fe-clock text-muted mb-0"></span>
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
                                            Geo
                                        </h6>
                                        <button className={'btn btn-sm text-stats p-0'} onClick={() => {
                                            handleShow()
                                        }}>View Map
                                        </button>
                                    </div>
                                    <div className="col-auto">
                                        <span className="h2 fe fe-globe text-muted mb-0"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <div className="col-md-12 pb-3 text-stats">
                    <div className="row">
                        <div className="mx-auto">
                            Active Nodes {this.state.totalNodes ?
                            <span
                                className={'nodes-badge p-1'}>{this.state.totalNodes}/{this.state.totalNodes}</span> :
                            <Spinner/>}
                        </div>
                        <div className="mx-auto">
                            {pinnedNodes.length > 0 ?
                                <span>Pinned Nodes</span> : ''} {pinnedNodes.length > 0 ?
                            <span
                                className={'nodes-badge p-1'}>{pinnedNodes.length}</span> : ''}
                        </div>
                        <div className="mx-auto">
                            {pinnedNodes.length > 0 ? <span className={'ml-3 overflow-auto'}>
                                Hide non-pinned Nodes {!this.state.hideNonPinned ?
                                <span className={'fe fe-square'} onClick={() => {
                                    setNonPinned(true)
                                }}></span> : <span className={'fe fe-x-square'} onClick={() => {
                                    setNonPinned(false)
                                }}></span>}
                            </span> : ''}
                        </div>
                        <div className="mx-auto">
                            Updating In: <TimeAgo date={this.state.lastUpdatedData}
                                                  formatter={formatter}/>
                        </div>
                    </div>
                </div>
                <div className={'col-md-12'}>
                    <div className={'table-responsive pt-3'}>
                        <Table className={'table table-sm table-nowrap card-table'} borderless variant="">
                            <thead className={'text-center text-muted'}>
                            <tr>
                                <th>Pin</th>
                                <th>Active</th>
                                <Tooltip title="Location of the node">
                                    <th>Location</th>
                                </Tooltip>
                                <Tooltip title="Name of the node">
                                    <th>ID</th>
                                </Tooltip>
                                <Tooltip title="Current version of efsn">
                                    <th>Type</th>
                                </Tooltip>
                                <Tooltip title="The current block height the node is at">
                                    <th>Height</th>
                                </Tooltip>
                                <Tooltip title="Time since last block">
                                    <th>Block Time</th>
                                </Tooltip>
                                <Tooltip title="Pending Transactions in current block">
                                    <th>Pending Txs</th>
                                </Tooltip>
                                <Tooltip title="Amount of tickets the node owns">
                                    <th>Tickets</th>
                                </Tooltip>
                                <Tooltip title="Mining state">
                                    <th>Mining</th>
                                </Tooltip>
                                <Tooltip title="Syncing state">
                                    <th>Syncing</th>
                                </Tooltip>
                                <Tooltip title="Amount of peers">
                                    <th>Peers</th>
                                </Tooltip>
                                <th>Uptime</th>
                                <Tooltip title="Latency between stats server and the node">
                                    <th>Latency</th>
                                </Tooltip>
                            </tr>
                            </thead>
                            <tbody className={'text-center'}>
                            {
                                this.state.nodeIdentifiers.map(((key, index) =>
                                        pinnedNodes.includes(this.state.nodesList[index].id) ?
                                            <tr>
                                                <td><a onClick={function () {
                                                    removePinnedNode(this.state.nodesList[index].id)
                                                }.bind(this)}>
                                                    <span className="fe fe-minus-square text-muted mb-0"></span>
                                                </a></td>
                                                <td>{this.state.nodesList[index].stats.active ?
                                                    <span className="text-success">●</span> :
                                                    <span className="text-danger">●</span>}</td>
                                                <td>{this.state.nodesList[index].geo ? <ReactCountryFlag cdnUrl={'/flags/4x3/'}
                                                    code={this.state.nodesList[index].geo.country.toLowerCase()}
                                                    svg/> : '?'}</td>
                                                <td>{this.state.nodesList[index].id}</td>
                                                <td>
                                                    <Tooltip title={this.state.nodesList[index].info.node}>
                                                        <span>{getVersionNumber(this.state.nodesList[index].info.node)}</span>
                                                    </Tooltip>
                                                </td>
                                                <td className={blockClass(this.state.nodesList[index].stats.block.number, this.state.highestBlock, getVersionNumber(this.state.nodesList[index].info.node))}>

                                                    {this.state.nodesList[index].stats.block.number ?
                                                        <NumberFormat
                                                            value={this.state.nodesList[index].stats.block.number}
                                                            displayType={'text'} thousandSeparator={true}
                                                            prefix={"# "}/>
                                                        :
                                                        <Spinner/>}
                                                    <span
                                                        className={'pl-4'}>{this.state.nodesList[index].stats.block.hash}
                                                        <AttentionWarning
                                                            highestBlock={this.state.highestBlock || 0}
                                                            currentBlock={this.state.nodesList[index].stats.block.number}
                                                            version={getVersionNumber(this.state.nodesList[index].info.node)}/>
                                                                      </span>
                                                </td>
                                                <td>{this.state.nodesList[index].stats.block.received ?
                                                    <TimeAgo
                                                        date={this.state.nodesList[index].stats.block.received}
                                                        formatter={formatter}/> :
                                                    <Spinner/>}</td>
                                                <td>{this.state.nodesList[index].stats.pending}</td>
                                                <Tooltip
                                                    title={getTicketPercentage(this.state.ticketNumber, this.state.nodesList[index].stats.myTicketNumber)}>
                                                    <td>{this.state.nodesList[index].stats.myTicketNumber}</td>
                                                </Tooltip>
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
                                                <td className={latencyClass(this.state.nodesList[index].stats.latency)}>{this.state.nodesList[index].stats.latency}ms</td>
                                            </tr>
                                            : ''
                                ))
                            }
                            {
                                this.state.nodeIdentifiers.map(((key, index) =>
                                        !pinnedNodes.includes(this.state.nodesList[index].id) && !this.state.hideNonPinned ?
                                            <tr>
                                                <td><a onClick={function () {
                                                    setPinnedNode(this.state.nodesList[index].id)
                                                }.bind(this)}>
                                                    <span className="fe fe-square text-muted mb-0"></span>
                                                </a></td>
                                                <td>{this.state.nodesList[index].stats.active ?
                                                    <span className="text-success">●</span> :
                                                    <span className="text-danger">●</span>}</td>
                                                <td>{this.state.nodesList[index].geo ? <ReactCountryFlag cdnUrl={'/flags/4x3/'}
                                                    code={this.state.nodesList[index].geo.country.toLowerCase()}
                                                    svg/> : '?'}</td>
                                                <td>{this.state.nodesList[index].id}</td>
                                                <td>
                                                    <Tooltip title={this.state.nodesList[index].info.node}>
                                                        <span>{getVersionNumber(this.state.nodesList[index].info.node)}</span>
                                                    </Tooltip>
                                                </td>
                                                <td className={blockClass(this.state.nodesList[index].stats.block.number, this.state.highestBlock, getVersionNumber(this.state.nodesList[index].info.node))}>

                                                    {this.state.nodesList[index].stats.block.number ?
                                                        <NumberFormat
                                                            value={this.state.nodesList[index].stats.block.number}
                                                            displayType={'text'} thousandSeparator={true}
                                                            prefix={"# "}/>
                                                        :
                                                        <Spinner/>}
                                                    <span
                                                        className={'pl-4'}>{this.state.nodesList[index].stats.block.hash}
                                                        <AttentionWarning
                                                            highestBlock={this.state.highestBlock || 0}
                                                            currentBlock={this.state.nodesList[index].stats.block.number}
                                                            version={getVersionNumber(this.state.nodesList[index].info.node)}/>
                                                                      </span>
                                                </td>
                                                <td>{this.state.nodesList[index].stats.block.received ?
                                                    <TimeAgo
                                                        date={this.state.nodesList[index].stats.block.received}
                                                        formatter={formatter}/> :
                                                    <Spinner/>}</td>
                                                <td>{this.state.nodesList[index].stats.pending}</td>
                                                <Tooltip
                                                    title={getTicketPercentage(this.state.ticketNumber, this.state.nodesList[index].stats.myTicketNumber)}>
                                                    <td>{this.state.nodesList[index].stats.myTicketNumber}</td>
                                                </Tooltip>
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
                                                <td className={latencyClass(this.state.nodesList[index].stats.latency)}>{this.state.nodesList[index].stats.latency}ms</td>
                                            </tr>
                                            : ''
                                ))
                            }
                            </tbody>
                        </Table>
                    </div>
                </div>
            </Container>
        </div>
        </body>;
    }
}

export default Main;
