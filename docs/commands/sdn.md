# SDN Commands

Read-only view of Software-Defined Networking resources. SDN allows defining virtual networks (VNets) and zones that span multiple nodes, typically used in multi-tenant or large-scale deployments.

## `sdn zones`

List all SDN zones configured in the cluster. Zones define the transport technology (VXLAN, EVPN, simple) used by the VNets within them.

```bash
./pm sdn zones
```

## `sdn vnets`

List all SDN VNets. A VNet is a virtual L2 network segment associated with a zone; VMs attach to VNets instead of physical bridges.

```bash
./pm sdn vnets
```

## `sdn subnets <vnet>`

List the IP subnets defined within a specific VNet. Subnets configure IPAM (automatic IP assignment) and gateway settings for VMs on that network.

```bash
./pm sdn subnets my-vnet
```
