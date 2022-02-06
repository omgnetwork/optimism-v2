/*
 Credit - This is PancakeSwap's PancakePredictionV2 with changes
 original contract - https://bscscan.com/address/0x18b2a687610328590bc8f2e5fedde3b582a49cda#code
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/security/Pausable.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';

import '@boba/turing-hybrid-compute/contracts/TuringHelper.sol';

/**
 * @title BobaBet
 */
contract BobaBet is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    TuringHelper private turing;

    string private turingUrl;
    string private turingPair;

    bool public genesisLockOnce = false;
    bool public genesisStartOnce = false;

    address public bobaTokenAddress;

    address public adminAddress; // address of the admin
    address public operatorAddress; // address of the operator

    uint256 public bufferSeconds; // number of seconds for valid execution of a prediction round
    uint256 public intervalSeconds; // interval in seconds between two prediction rounds

    uint256 public minBetAmount; // minimum betting amount (denominated in wei)
    uint256 public treasuryFee; // treasury rate (e.g. 200 = 2%, 150 = 1.50%)
    uint256 public treasuryAmount; // treasury amount that was not claimed

    uint256 public currentEpoch; // current epoch for prediction round

    uint256 public constant MAX_TREASURY_FEE = 1000; // 10%

    mapping(uint256 => mapping(address => BetInfo)) public ledger;
    mapping(uint256 => Round) public rounds;
    mapping(address => uint256[]) public userRounds;

    enum Position {
        Up,
        Down
    }

    struct Round {
        uint256 epoch;
        uint256 startTimestamp;
        uint256 lockTimestamp;
        uint256 closeTimestamp;
        uint8 lockNumber; //
        uint8 closeNumber;
        uint256 closeTuringTimestamp;
        uint256 totalAmount;
        uint256 upAmount;
        uint256 downAmount;
        uint256 rewardBaseCalAmount;
        uint256 rewardAmount;
        bool turingCalled;
    }

    struct BetInfo {
        Position position;
        uint256 amount;
        bool claimed; // default false
    }

    event BetDown(address indexed sender, uint256 indexed epoch, uint256 amount);
    event BetUp(address indexed sender, uint256 indexed epoch, uint256 amount);
    event Claim(address indexed sender, uint256 indexed epoch, uint256 amount);
    event EndRound(uint256 indexed epoch, uint256 indexed timestamp, uint8 closeNumber);
    event LockRound(uint256 indexed epoch, uint8 lockNumber);

    event NewAdminAddress(address admin);
    event NewBufferAndIntervalSeconds(uint256 bufferSeconds, uint256 intervalSeconds);
    event NewMinBetAmount(uint256 indexed epoch, uint256 minBetAmount);
    event NewTreasuryFee(uint256 indexed epoch, uint256 treasuryFee);
    event NewOperatorAddress(address operator);
    event NewTuring(address turingAddress);

    event Pause(uint256 indexed epoch);
    event RewardsCalculated(
        uint256 indexed epoch,
        uint256 rewardBaseCalAmount,
        uint256 rewardAmount,
        uint256 treasuryAmount
    );

    event StartRound(uint256 indexed epoch);
    event TokenRecovery(address indexed token, uint256 amount);
    event TreasuryClaim(uint256 amount);
    event Unpause(uint256 indexed epoch);

    event GetRandomNumber(uint8 randomNumber);

    event NewBobaTokenAddress(address bobaTokenAddress);

    modifier onlyAdmin() {
        require(msg.sender == adminAddress, "Not admin");
        _;
    }

    modifier onlyAdminOrOperator() {
        require(msg.sender == adminAddress || msg.sender == operatorAddress, "Not operator/admin");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operatorAddress, "Not operator");
        _;
    }

    modifier notContract() {
        require(!_isContract(msg.sender), "Contract not allowed");
        require(msg.sender == tx.origin, "Proxy contract not allowed");
        _;
    }

    /**
     * @notice Constructor
     * @param _turingAddress: turing address
     * @param _adminAddress: admin address
     * @param _operatorAddress: operator address
     * @param _intervalSeconds: number of time within an interval
     * @param _bufferSeconds: buffer of time for resolution of random number
     * @param _minBetAmount: minimum bet amounts (in wei)
     * @param _treasuryFee: treasury fee (1000 = 10%)
     * @param _bobaTokenAddress: bobaTokenAddress
     */
    constructor(
        address _turingAddress,
        address _adminAddress,
        address _operatorAddress,
        uint256 _intervalSeconds,
        uint256 _bufferSeconds,
        uint256 _minBetAmount,
        uint256 _treasuryFee,
        address _bobaTokenAddress
    ) {
        require(_treasuryFee <= MAX_TREASURY_FEE, "Treasury fee too high");
        require(_bufferSeconds < _intervalSeconds, "bufferSeconds must be inferior to intervalSeconds");

        turing = TuringHelper(_turingAddress);
        adminAddress = _adminAddress;
        operatorAddress = _operatorAddress;
        intervalSeconds = _intervalSeconds;
        bufferSeconds = _bufferSeconds;
        minBetAmount = _minBetAmount;
        treasuryFee = _treasuryFee;
        bobaTokenAddress = _bobaTokenAddress;
    }

    /**
     * @notice Bet down position
     * @param epoch: epoch
     * @param value: boba token amount
     */
    function betDown(uint256 epoch, uint256 value) external payable whenNotPaused nonReentrant notContract {
        require(epoch == currentEpoch, "Bet is too early/late");
        require(_bettable(epoch), "Round not bettable");
        require(ledger[epoch][msg.sender].amount == 0, "Can only bet once per round");
        require(value >= minBetAmount, "Bet amount must be greater than minBetAmount");

        // Transfer Boba token this contract
        IERC20(bobaTokenAddress).safeTransferFrom(msg.sender, address(this), value);

        // Update round data
        uint256 amount = value;
        Round storage round = rounds[epoch];
        round.totalAmount = round.totalAmount + amount;
        round.downAmount = round.downAmount + amount;

        // Update user data
        BetInfo storage betInfo = ledger[epoch][msg.sender];
        betInfo.position = Position.Down;
        betInfo.amount = amount;
        userRounds[msg.sender].push(epoch);

        emit BetDown(msg.sender, epoch, amount);
    }

    /**
     * @notice Bet up position
     * @param epoch: epoch
     * @param value: boba token amount
     */
    function betUp(uint256 epoch, uint256 value) external payable whenNotPaused nonReentrant notContract {
        require(epoch == currentEpoch, "Bet is too early/late");
        require(_bettable(epoch), "Round not bettable");
        require(ledger[epoch][msg.sender].amount == 0, "Can only bet once per round");
        require(value >= minBetAmount, "Bet amount must be greater than minBetAmount");

        // Transfer Boba token this contract
        IERC20(bobaTokenAddress).safeTransferFrom(msg.sender, address(this), value);

        // Update round data
        uint256 amount = value;
        Round storage round = rounds[epoch];
        round.totalAmount = round.totalAmount + amount;
        round.upAmount = round.upAmount + amount;

        // Update user data
        BetInfo storage betInfo = ledger[epoch][msg.sender];
        betInfo.position = Position.Up;
        betInfo.amount = amount;
        userRounds[msg.sender].push(epoch);

        emit BetUp(msg.sender, epoch, amount);
    }

    /**
     * @notice Claim reward for an array of epochs
     * @param epochs: array of epochs
     */
    function claim(uint256[] calldata epochs) external nonReentrant notContract {
        uint256 reward; // Initializes reward

        for (uint256 i = 0; i < epochs.length; i++) {
            require(rounds[epochs[i]].startTimestamp != 0, "Round has not started");
            require(block.timestamp > rounds[epochs[i]].closeTimestamp, "Round has not ended");

            uint256 addedReward = 0;

            // Round valid, claim rewards
            if (rounds[epochs[i]].turingCalled) {
                require(claimable(epochs[i], msg.sender), "Not eligible for claim");
                Round memory round = rounds[epochs[i]];
                addedReward = (ledger[epochs[i]][msg.sender].amount * round.rewardAmount) / round.rewardBaseCalAmount;
            }
            // Round invalid, refund bet amount
            else {
                require(refundable(epochs[i], msg.sender), "Not eligible for refund");
                addedReward = ledger[epochs[i]][msg.sender].amount;
            }

            ledger[epochs[i]][msg.sender].claimed = true;
            reward += addedReward;

            emit Claim(msg.sender, epochs[i], addedReward);
        }

        if (reward > 0) {
            IERC20(bobaTokenAddress).safeTransfer(address(msg.sender), reward);
        }
    }

    /**
     * @notice Start the next round n, lock random number for round n-1, end round n-2
     * @dev Callable by operator
     */
    function executeRound() external whenNotPaused onlyOperator {
        require(
            genesisStartOnce && genesisLockOnce,
            "Can only run after genesisStartRound and genesisLockRound is triggered"
        );

        // Make sure that turing is working
        uint8 randomNumber = _getRandomNumber();

        // CurrentEpoch refers to previous round (n-1)
        _safeLockRound(currentEpoch);
        _safeEndRound(currentEpoch - 1, randomNumber);
        _calculateRewards(currentEpoch - 1);

        // Increment currentEpoch to current round (n)
        currentEpoch = currentEpoch + 1;
        _safeStartRound(currentEpoch);
    }

    /**
     * @notice Lock genesis round
     * @dev Callable by operator
     */
    function genesisLockRound() external whenNotPaused onlyOperator {
        require(genesisStartOnce, "Can only run after genesisStartRound is triggered");
        require(!genesisLockOnce, "Can only run genesisLockRound once");

        uint8 randomNumber = _getRandomNumber();

        _safeLockRound(currentEpoch);

        currentEpoch = currentEpoch + 1;
        _startRound(currentEpoch);
        genesisLockOnce = true;
    }

    /**
     * @notice Start genesis round
     * @dev Callable by admin or operator
     */
    function genesisStartRound() external whenNotPaused onlyOperator {
        require(!genesisStartOnce, "Can only run genesisStartRound once");

        uint8 randomNumber = _getRandomNumber();

        currentEpoch = currentEpoch + 1;
        _startRound(currentEpoch);
        genesisStartOnce = true;
    }

    /**
     * @notice called by the admin to pause, triggers stopped state
     * @dev Callable by admin or operator
     */
    function pause() external whenNotPaused onlyAdminOrOperator {
        _pause();

        emit Pause(currentEpoch);
    }

    /**
     * @notice Claim all rewards in treasury
     * @dev Callable by admin
     */
    function claimTreasury() external nonReentrant onlyAdmin {
        uint256 currentTreasuryAmount = treasuryAmount;
        treasuryAmount = 0;
        IERC20(bobaTokenAddress).safeTransfer(adminAddress, currentTreasuryAmount);

        emit TreasuryClaim(currentTreasuryAmount);
    }

    /**
     * @notice called by the admin to unpause, returns to normal state
     * Reset genesis state. Once paused, the rounds would need to be kickstarted by genesis
     */
    function unpause() external whenPaused onlyAdmin {
        genesisStartOnce = false;
        genesisLockOnce = false;
        _unpause();

        emit Unpause(currentEpoch);
    }

    /**
     * @notice Set buffer and interval (in seconds)
     * @dev Callable by admin
     */
    function setBufferAndIntervalSeconds(uint256 _bufferSeconds, uint256 _intervalSeconds)
        external
        whenPaused
        onlyAdmin
    {
        require(_bufferSeconds < _intervalSeconds, "bufferSeconds must be inferior to intervalSeconds");
        bufferSeconds = _bufferSeconds;
        intervalSeconds = _intervalSeconds;

        emit NewBufferAndIntervalSeconds(_bufferSeconds, _intervalSeconds);
    }

    /**
     * @notice Set minBetAmount
     * @dev Callable by admin
     */
    function setMinBetAmount(uint256 _minBetAmount) external whenPaused onlyAdmin {
        require(_minBetAmount != 0, "Must be superior to 0");
        minBetAmount = _minBetAmount;

        emit NewMinBetAmount(currentEpoch, minBetAmount);
    }

    /**
     * @notice Set operator address
     * @dev Callable by admin
     */
    function setOperator(address _operatorAddress) external onlyAdmin {
        require(_operatorAddress != address(0), "Cannot be zero address");
        operatorAddress = _operatorAddress;

        emit NewOperatorAddress(_operatorAddress);
    }

    /**
     * @notice Set operator address
     * @dev Callable by admin
     */
    function setBobaTokenAddress(address _bobaTokenAddress) external whenPaused onlyAdmin {
        require(_bobaTokenAddress != address(0), "Cannot be zero address");
        bobaTokenAddress = _bobaTokenAddress;

        emit NewBobaTokenAddress(_bobaTokenAddress);
    }

    /**
     * @notice Set Turing address
     * @dev Callable by admin
     * @param _turingAddress turing address
     */
    function setTuring(address _turingAddress) external whenPaused onlyAdmin {
        require(_turingAddress != address(0), "Cannot be zero address");
        turing = TuringHelper(_turingAddress);

        // Dummy check to make sure the interface implements this function properly
        _getRandomNumber();

        emit NewTuring(_turingAddress);
    }

    /**
     * @notice Set treasury fee
     * @dev Callable by admin
     */
    function setTreasuryFee(uint256 _treasuryFee) external whenPaused onlyAdmin {
        require(_treasuryFee <= MAX_TREASURY_FEE, "Treasury fee too high");
        treasuryFee = _treasuryFee;

        emit NewTreasuryFee(currentEpoch, treasuryFee);
    }

    /**
     * @notice It allows the owner to recover tokens sent to the contract by mistake
     * @param _token: token address
     * @param _amount: token amount
     * @dev Callable by owner
     */
    function recoverToken(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(address(msg.sender), _amount);

        emit TokenRecovery(_token, _amount);
    }

    /**
     * @notice Set admin address
     * @dev Callable by owner
     */
    function setAdmin(address _adminAddress) external onlyOwner {
        require(_adminAddress != address(0), "Cannot be zero address");
        adminAddress = _adminAddress;

        emit NewAdminAddress(_adminAddress);
    }

    /**
     * @notice Returns round epochs and bet information for a user that has participated
     * @param user: user address
     * @param cursor: cursor
     * @param size: size
     */
    function getUserRounds(
        address user,
        uint256 cursor,
        uint256 size
    )
        external
        view
        returns (
            uint256[] memory,
            BetInfo[] memory,
            uint256
        )
    {
        uint256 length = size;

        if (length > userRounds[user].length - cursor) {
            length = userRounds[user].length - cursor;
        }

        uint256[] memory values = new uint256[](length);
        BetInfo[] memory betInfo = new BetInfo[](length);

        for (uint256 i = 0; i < length; i++) {
            values[i] = userRounds[user][cursor + i];
            betInfo[i] = ledger[values[i]][user];
        }

        return (values, betInfo, cursor + length);
    }

    /**
     * @notice Returns round epochs length
     * @param user: user address
     */
    function getUserRoundsLength(address user) external view returns (uint256) {
        return userRounds[user].length;
    }

    /**
     * @notice Get the claimable stats of specific epoch and user account
     * @param epoch: epoch
     * @param user: user address
     */
    function claimable(uint256 epoch, address user) public view returns (bool) {
        BetInfo memory betInfo = ledger[epoch][user];
        Round memory round = rounds[epoch];
        return
            round.turingCalled &&
            betInfo.amount != 0 &&
            !betInfo.claimed &&
            ((round.closeNumber >= round.lockNumber && betInfo.position == Position.Up) ||
                (round.closeNumber < round.lockNumber && betInfo.position == Position.Down));
    }

    /**
     * @notice Get the refundable stats of specific epoch and user account
     * @param epoch: epoch
     * @param user: user address
     */
    function refundable(uint256 epoch, address user) public view returns (bool) {
        BetInfo memory betInfo = ledger[epoch][user];
        Round memory round = rounds[epoch];
        return
            !round.turingCalled &&
            !betInfo.claimed &&
            block.timestamp > round.closeTimestamp + bufferSeconds &&
            betInfo.amount != 0;
    }

    /**
     * @notice Calculate rewards for round
     * @param epoch: epoch
     */
    function _calculateRewards(uint256 epoch) internal {
        require(rounds[epoch].rewardBaseCalAmount == 0 && rounds[epoch].rewardAmount == 0, "Rewards calculated");
        Round storage round = rounds[epoch];
        uint256 rewardBaseCalAmount;
        uint256 treasuryAmt;
        uint256 rewardAmount;

        // Up wins
        if (round.closeNumber >= round.lockNumber) {
            rewardBaseCalAmount = round.upAmount;
            treasuryAmt = (round.totalAmount * treasuryFee) / 10000;
            rewardAmount = round.totalAmount - treasuryAmt;
        }
        // Down wins
        else if (round.closeNumber < round.lockNumber) {
            rewardBaseCalAmount = round.downAmount;
            treasuryAmt = (round.totalAmount * treasuryFee) / 10000;
            rewardAmount = round.totalAmount - treasuryAmt;
        }
        round.rewardBaseCalAmount = rewardBaseCalAmount;
        round.rewardAmount = rewardAmount;

        // Add to treasury
        treasuryAmount += treasuryAmt;

        emit RewardsCalculated(epoch, rewardBaseCalAmount, rewardAmount, treasuryAmt);
    }

    /**
     * @notice End round
     * @param epoch: epoch
     * @param randomNumber: random number
     */
    function _safeEndRound(
        uint256 epoch,
        uint8 randomNumber
    ) internal {
        require(rounds[epoch].lockTimestamp != 0, "Can only end round after round has locked");
        require(block.timestamp >= rounds[epoch].closeTimestamp, "Can only end round after closeTimestamp");
        require(
            block.timestamp <= rounds[epoch].closeTimestamp + bufferSeconds,
            "Can only end round within bufferSeconds"
        );
        Round storage round = rounds[epoch];
        round.closeNumber = randomNumber;
        round.closeTuringTimestamp = block.timestamp;
        round.turingCalled = true;

        emit EndRound(epoch, round.closeTuringTimestamp, round.closeNumber);
    }

    /**
     * @notice Lock round
     * @param epoch: epoch
     */
    function _safeLockRound(
        uint256 epoch
    ) internal {
        require(rounds[epoch].startTimestamp != 0, "Can only lock round after round has started");
        require(block.timestamp >= rounds[epoch].lockTimestamp, "Can only lock round after lockTimestamp");
        require(
            block.timestamp <= rounds[epoch].lockTimestamp + bufferSeconds,
            "Can only lock round within bufferSeconds"
        );
        Round storage round = rounds[epoch];
        round.closeTimestamp = block.timestamp + intervalSeconds;
        round.lockNumber = 128; // 2^8 /2 = 256 /2 = 128

        emit LockRound(epoch, round.lockNumber);
    }

    /**
     * @notice Start round
     * Previous round n-2 must end
     * @param epoch: epoch
     */
    function _safeStartRound(uint256 epoch) internal {
        require(genesisStartOnce, "Can only run after genesisStartRound is triggered");
        require(rounds[epoch - 2].closeTimestamp != 0, "Can only start round after round n-2 has ended");
        require(
            block.timestamp >= rounds[epoch - 2].closeTimestamp,
            "Can only start new round after round n-2 closeTimestamp"
        );
        _startRound(epoch);
    }

    /**
     * @notice Start round
     * Previous round n-2 must end
     * @param epoch: epoch
     */
    function _startRound(uint256 epoch) internal {
        Round storage round = rounds[epoch];
        round.startTimestamp = block.timestamp;
        round.lockTimestamp = block.timestamp + intervalSeconds;
        round.closeTimestamp = block.timestamp + (2 * intervalSeconds);
        round.epoch = epoch;
        round.totalAmount = 0;

        emit StartRound(epoch);
    }

    /**
     * @notice Determine if a round is valid for receiving bets
     * Round must have started and locked
     * Current timestamp must be within startTimestamp and closeTimestamp
     */
    function _bettable(uint256 epoch) internal view returns (bool) {
        return
            rounds[epoch].startTimestamp != 0 &&
            rounds[epoch].lockTimestamp != 0 &&
            block.timestamp > rounds[epoch].startTimestamp &&
            block.timestamp < rounds[epoch].lockTimestamp;
    }

    /**
     * @notice Returns true if `account` is a contract.
     * @param account: account address
     */
    function _isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    function _getRandomNumber() public returns (uint8) {

        uint256 result = turing.TuringRandom();

        bytes memory i_bytes = abi.encodePacked(result);

        uint8 randomNumber  = uint8(i_bytes[ 0]);

        emit GetRandomNumber(randomNumber);

        return randomNumber;
    }

    function getBlockTimstamp() public view returns (uint256) {
        return block.timestamp;
    }
}
