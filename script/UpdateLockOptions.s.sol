// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/RWANSecureStakingV3.sol";

contract UpdateLockOptions is Script {
    function run() external {
        address payable stakingAddress = payable(0x890Bc48a6463586c75a7C9db0Af7FC3e5cA15625);
        RWANSecureStakingV3 staking = RWANSecureStakingV3(stakingAddress);

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        console.log("Updating lock options on contract:", stakingAddress);

        // 1. Update existing options
        // ID 1: 90 days -> 2.1x (21000 bps)
        staking.setLockOption(1, 21000, true);
        console.log("Updated Lock ID 1 (90 days) to 2.1x");

        // ID 2: 180 days -> 4x (40000 bps)
        staking.setLockOption(2, 40000, true);
        console.log("Updated Lock ID 2 (180 days) to 4x");

        // 2. Add new 30-day option (ID 3)
        // 30 days -> 1.3x (13000 bps)
        staking.addLockOption(30 days, 13000, true);
        console.log("Added Lock ID 3 (30 days) with 1.3x");

        vm.stopBroadcast();
    }
}
