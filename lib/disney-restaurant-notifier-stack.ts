import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_ecr_assets as ecra,
  aws_ecs as ecs,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class DisneyRestaurantNotifierStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { isDefault: true })
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc, })
    const taskDefinition = new ecs.TaskDefinition(this, 'TaskDefinition', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '256',
      memoryMiB: '512',
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.ARM64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
      },
    })
    taskDefinition.addContainer('Container', {
      image: ecs.ContainerImage.fromAsset('./', {
        platform: ecra.Platform.LINUX_ARM64,
      }),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: this.stackName }),
    })
    new ecs.FargateService(this, 'Service', {
      assignPublicIp: true,
      circuitBreaker: { rollback: true },
      cluster,
      desiredCount: 1,
      enableExecuteCommand: true,
      maxHealthyPercent: 200,
      minHealthyPercent: 100,
      platformVersion: ecs.FargatePlatformVersion.VERSION1_4,
      taskDefinition,
    })
  }
}
